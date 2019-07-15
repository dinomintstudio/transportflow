import {Injectable} from '@angular/core';
import {TiledTerrain} from "../model/TiledTerrain";
import {TerrainGenerationConfig} from "../config/TerrainGenerationConfig";
import {TerrainTile} from "../model/TerrainTile";
import {Matrix} from "../../../common/model/Matrix";

import _ from 'lodash'
import {Position} from "../../../common/model/Position";
import {NoiseService} from "../../math/service/noise.service";
import {FractionService} from "../../math/service/fraction.service";
import {Surface} from "../../../game-logic/model/Surface";
import {AltitudeMapConfig} from "../config/AltitudeMapConfig";

import {matches} from 'z';
import {Biome} from "../../../game-logic/model/Biome";
import {HumidityMapConfig} from "../config/HumidityMapConfig";
import {TemperatureMapConfig} from "../config/TemperatureMapConfig";
import {Maybe} from "../../../common/model/Maybe";

@Injectable({
	providedIn: 'root'
})
export class TerrainGenerationService {

	constructor(
		private noiseService: NoiseService,
		private fractionService: FractionService
	) {
	}

	generate(config: TerrainGenerationConfig): TiledTerrain {
		const tiledTerrain = new TiledTerrain();
		tiledTerrain.tilemap = new Matrix<TerrainTile>(config.mapSize);

		_.range(config.mapSize.width).forEach(x => {
			_.range(config.mapSize.height).forEach(y => {
				const position = new Position(x, y);
				const terrainTile = this.generateTile(config, position);
				tiledTerrain.tilemap.set(position, terrainTile);
			})
		});

		return tiledTerrain;
	}

	private generateTile(config: TerrainGenerationConfig, position: Position): TerrainTile {
		let terrainTile = new TerrainTile();

		terrainTile.surface = this.tileSurface(config.altitudeMapConfig, position);
		if (terrainTile.surface.type === 'land') {
			terrainTile.biome = new Maybe<Biome>(this.tileBiome(config.humidityMapConfig, position));
		} else {
			terrainTile.biome = new Maybe<Biome>();
		}
		terrainTile.isSnow = this.tileIsSnow(config.temperatureMapConfig, position);

		// TODO: complete

		return terrainTile;
	}

	private tileSurface(config: AltitudeMapConfig, position: Position): Surface {
		const pattern = this.fractionService.in(
			this.fractionService.calculateRanges([
				config.waterFraction,
				config.landFraction,
				config.mountainFraction
			]),
			this.noiseService.generate(position, config.noiseConfig)
		);

		return matches(pattern)(
			(x = 0) => new Surface('water'),
			(x = 1) => new Surface('land'),
			(x = 2) => new Surface('mountain')
		);
	}

	private tileBiome(config: HumidityMapConfig, position: Position): Biome {
		const pattern = this.fractionService.in(
			this.fractionService.calculateRanges([
				config.desertFraction,
				config.taigaFraction,
				config.jungleFraction
			]),
			this.noiseService.generate(position, config.noiseConfig)
		);

		return matches(pattern)(
			(x = 0) => new Biome('desert'),
			(x = 1) => new Biome('taiga'),
			(x = 2) => new Biome('jungle')
		);
	}

	private tileIsSnow(config: TemperatureMapConfig, position: Position): Boolean {
		const pattern = this.fractionService.in(
			this.fractionService.calculateRanges([
				config.landFraction,
				config.snowFraction
			]),
			this.noiseService.generate(position, config.noiseConfig)
		);

		return matches(pattern)(
			(x = 0) => false,
			(x = 1) => true
		);
	}

}
