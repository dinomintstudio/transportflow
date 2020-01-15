import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {World} from "../model/World";
import {TiledTerrain} from "../../generation/terrain/model/TiledTerrain";
import {WorldGenerationConfig} from "../../generation/world/config/WorldGenerationConfig";
import {Tile} from "../model/Tile";
import {Maybe} from "../../common/model/Maybe";
import {CityGenerationService} from "../../generation/city/service/city-generation.service";
import {TiledCity} from "../../generation/city/model/TiledCity";
import {Matrix} from "../../common/model/Matrix";
import {TerrainTile} from "../../generation/terrain/model/TerrainTile";
import {Position} from "../../common/model/Position";
import {Road} from "../model/Road";
import {RoadTile} from "../model/RoadTile";
import {Building} from "../model/Building";
import {House} from "../model/House";

@Injectable({
	providedIn: 'root'
})
export class WorldService {

	world: ObservableData<World> = new ObservableData<World>();

	constructor(
		private cityGenerationService: CityGenerationService
	) {
	}

	generate(tiledTerrain: TiledTerrain, config: WorldGenerationConfig): World {
		console.debug('generate world');
		const tilemap: Matrix<Tile> = this.mapTerrainMatrixToTileMatrix(tiledTerrain.tilemap);

		tiledTerrain.cityPoints.forEach(cityPosition => {
			const city: TiledCity = this.cityGenerationService.generate(config.cityGenerationConfig);
			// place cityPoint in the center of city tilemap
			const worldCityPosition: Position = cityPosition.add(new Position(
				-city.tilemap.shape.width / 2,
				-city.tilemap.shape.height / 2
			).floor());

			this.fillCityTile(city, worldCityPosition, tilemap);
			this.placeBuildings(city, worldCityPosition, tilemap);
		});

		return new World(
			tilemap,
			config
		)
	}

	private placeBuildings(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.generatedCityTemplate.buildings.forEach((building) => {
			const worldTilePosition: Position = worldCityPosition.add(building.position.topLeft);
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return;
			const worldTile: Tile = tilemap.at(worldTilePosition);

			if (worldTile.surface.type !== 'land') return;

			worldTile.isPlant = false;
			worldTile.city = new Maybe<TiledCity>(city);
			worldTile.building = new Maybe<Building>(new House(building.position));
		});
	}

	private fillCityTile(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.tilemap.forEach((cityTile, position) => {
			if (!cityTile.isPresent()) return;

			const worldTilePosition: Position = worldCityPosition.add(position);
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return;
			const worldTile: Tile = tilemap.at(worldTilePosition);

			if (worldTile.surface.type !== 'land') return;

			worldTile.isPlant = false;
			worldTile.city = new Maybe<TiledCity>(city);

			if (cityTile.get().type == 'road') {
				worldTile.road = new Maybe<RoadTile>(new RoadTile(
					Maybe.empty(),
					new Maybe(new Road('roadway')),
					Maybe.empty()
				));
			}
		});
	}

	private mapTerrainMatrixToTileMatrix(terrainMatrix: Matrix<TerrainTile>): Matrix<Tile> {
		return terrainMatrix.map(terrainTile => new Tile(
			terrainTile.surface,
			terrainTile.biome,
			terrainTile.isPlant,
			terrainTile.isSnow,
			Maybe.empty(),
			Maybe.empty(),
			Maybe.empty()
		));
	}

}
