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
import {AltitudeMapConfig} from "../config/noisemap/AltitudeMapConfig";

import {matches} from 'z';
import {Biome} from "../../../game-logic/model/Biome";
import {TemperatureMapConfig} from "../config/noisemap/TemperatureMapConfig";
import {Maybe} from "../../../common/model/Maybe";
import {RandomService} from "../../../random/service/random.service";
import {BiomeConfig} from "../config/biome/BiomeConfig";
import {DistributionService} from "../../math/service/distribution.service";

/**
 * Terrain generation service. Responsible for terrain generation
 */
@Injectable({
	providedIn: 'root'
})
export class TerrainGenerationService {

	/**
	 * Constructs service
	 * @param noiseService
	 * @param fractionService
	 * @param randomService
	 * @param distributionService
	 * @param randomService
	 * @param distributionService
	 */
	constructor(
		private noiseService: NoiseService,
		private fractionService: FractionService,
		private randomService: RandomService,
		private distributionService: DistributionService
	) {
	}

	/**
	 * Generates tiled terrain by specified config
	 * @param config terrain generation config
	 */
	generate(config: TerrainGenerationConfig): TiledTerrain {
		const cityPoints = this.distributionService.distribute(config.mapSize, config.cityPerTile);

		const tiledTerrain = new TiledTerrain(null, cityPoints);
		tiledTerrain.tilemap = new Matrix<TerrainTile>(config.mapSize);

		_.range(config.mapSize.width).forEach(x => {
			_.range(config.mapSize.height).forEach(y => {
				const position = new Position(x, y);
				const terrainTile = this.generateTile(config, position, tiledTerrain.cityPoints);
				tiledTerrain.tilemap.set(position, terrainTile);
			})
		});

		return tiledTerrain;
	}

	/**
	 * Generates tile
	 * @param config
	 * @param position
	 * @param cityPoints
	 */
	private generateTile(config: TerrainGenerationConfig, position: Position, cityPoints: Position[]): TerrainTile {
		let terrainTile = new TerrainTile();

		terrainTile.surface = this.tileSurface(config.altitudeMapConfig, position);
		if (terrainTile.surface.type === 'land') {
			terrainTile.biome = new Maybe<Biome>(this.tileBiome(config, position));
		} else {
			terrainTile.biome = new Maybe<Biome>();
		}
		terrainTile.isSnow = this.tileIsSnow(config.temperatureMapConfig, position);
		terrainTile.isPlant = this.tileIsPlant(config, terrainTile.biome);
		terrainTile.isCity = this.tileIsCity(position, cityPoints);

		return terrainTile;
	}

	/**
	 * Generates surface
	 * @param config
	 * @param position
	 */
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

	/**
	 * Generates biome
	 * @param config
	 * @param position
	 */
	private tileBiome(config: TerrainGenerationConfig, position: Position): Biome {
		const pattern = this.fractionService.in(
			this.fractionService.calculateRanges([
				config.humidityMapConfig.desertFraction,
				config.humidityMapConfig.taigaFraction,
				config.humidityMapConfig.jungleFraction
			]),
			this.noiseService.generate(position, config.humidityMapConfig.noiseConfig)
		);

		return matches(pattern)(
			(x = 0) => new Biome('desert', config.biomesConfig.desertBiomeConfig),
			(x = 1) => new Biome('taiga', config.biomesConfig.taigaBiomeConfig),
			(x = 2) => new Biome('jungle', config.biomesConfig.jungleBiomeConfig)
		);
	}

	/**
	 * Defines is tile is in snow
	 * @param config
	 * @param position
	 */
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

	/**
	 * Defines is tile has plant
	 * @param config
	 * @param biome
	 */
	private tileIsPlant(config: TerrainGenerationConfig, biome: Maybe<Biome>): Boolean {
		if (!biome.isPresent()) return false;
		let biomeConfig: BiomeConfig = matches(biome.get().type)(
			(x = 'desert') => config.biomesConfig.desertBiomeConfig,
			(x = 'taiga') => config.biomesConfig.taigaBiomeConfig,
			(x = 'jungle') => config.biomesConfig.jungleBiomeConfig
		);
		return this.randomService.withProbability(config.plantPerTile * biomeConfig.plantK);
	}

	/**
	 * Defines is specified tile match city starting point
	 * @param position
	 * @param cityPoints
	 */
	private tileIsCity(position: Position, cityPoints: Position[]): Boolean {
		return !!cityPoints.find(p => p.x === position.x && p.y === position.y);
	}
}
