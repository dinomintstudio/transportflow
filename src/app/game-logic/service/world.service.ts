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
import {Rectangle} from "../../common/model/Rectangle";
import {Shape} from "../../common/model/Shape";
import {Log} from "../../common/model/Log";
import {MonoTypeOperatorFunction} from "rxjs";
import {withLatestFrom} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class WorldService {

	log: Log = new Log(this);

	world: ObservableData<World> = new ObservableData<World>();

	constructor(
		private cityGenerationService: CityGenerationService
	) {
	}

	generate(tiledTerrain: TiledTerrain, config: WorldGenerationConfig): World {
		this.log.debug('generate world');
		const tilemap: Matrix<Tile> = this.mapTerrainMatrixToTileMatrix(tiledTerrain.tilemap);

		tiledTerrain.cityPoints
			.filter(p => this.canPlaceCity(tiledTerrain.tilemap, p))
			.forEach(cityPosition => {
				const city: TiledCity = this.cityGenerationService.generate(config.cityGenerationConfig);
				// place cityPoint in the center of city tilemap
				const worldCityPosition: Position = cityPosition.add(
					Position
						.fromShape(city.tilemap.shape.map(c => -c / 2))
						.floor()
				);

				this.fillCityTile(city, worldCityPosition, tilemap);
				this.placeBuildings(city, worldCityPosition, tilemap);
			});

		return new World(
			tilemap,
			config
		)
	}

	getAdjacentTileMatrix(tilemap: Matrix<Tile>, position: Position): Matrix<Maybe<Tile>> {
		return tilemap
			.of(Rectangle.rectangleByOnePoint(
				position.map(c => c - 1),
				Shape.square(3)
			))
			.map(t => new Maybe<Tile>(t));
	}

	/**
	 * Map unbounded world position to bounded position.
	 * For example, if world map is [32, 32] tiles and input position is [-2, 40], output will be [30, 8].
	 */
	boundPosition(): MonoTypeOperatorFunction<Position> {
		return withLatestFrom(
			this.world.observable,
			(pos, world) => pos.mapEach(
				x => x > 0
					? x % world.tilemap.shape.width
					: world.tilemap.shape.width + (x % world.tilemap.shape.width),
				y => y > 0
					? y % world.tilemap.shape.height
					: world.tilemap.shape.height + (y % world.tilemap.shape.height),
			)
		);
	}

	private placeBuildings(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.generatedCityTemplate.buildings.forEach((building) => {
			const worldTilePosition: Position = worldCityPosition.add(building.position.topLeft);
			building.position = building.position.translate(worldCityPosition);
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return;
			const worldTile: Tile = tilemap.at(worldTilePosition);

			const adjacentTileMatrix = this.getAdjacentTileMatrix(tilemap, worldTilePosition);
			if (!this.canBuild(worldTile)) return;
			if (!this.canBuildBuilding(building, adjacentTileMatrix)) return;

			worldTile.isPlant = false;
			worldTile.city = new Maybe<TiledCity>(city);
			worldTile.building = new Maybe<Building>(building);
			if (building.position.shape.height === 1) {
				adjacentTileMatrix.at(new Position(1, 2)).ifPresent(t => t.building = worldTile.building);
			}
			if (building.position.shape.width === 1) {
				adjacentTileMatrix.at(new Position(2, 1)).ifPresent(t => t.building = worldTile.building);
			}
			if (building.position.shape.area() === 1) {
				adjacentTileMatrix.at(new Position(2, 2)).ifPresent(t => t.building = worldTile.building);
			}
		});
	}

	private fillCityTile(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.tilemap.forEach((cityTile, position) => {
			if (!cityTile.isPresent()) return;

			const worldTilePosition: Position = worldCityPosition.add(position);
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return;
			const worldTile: Tile = tilemap.at(worldTilePosition);

			if (!this.canBuild(worldTile)) return;

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

	private canBuild(tile: Tile): Boolean {
		return tile.surface.type === 'land' && !tile.road.isPresent() && !tile.building.isPresent();
	}

	private canBuildBuilding(building: Building, adjacentTiles: Matrix<Maybe<Tile>>): Boolean {
		const centerTile = adjacentTiles.at(new Position(1, 1));
		const middleRightTile = adjacentTiles.at(new Position(2, 1));
		const bottomCenterTile = adjacentTiles.at(new Position(1, 2));
		const bottomRightTile = adjacentTiles.at(new Position(2, 2));

		if (!this.canBuild(centerTile.get())) return false;
		if (building.position.shape.area() === 1 &&
			(!bottomRightTile.isPresent() || !this.canBuild(bottomRightTile.get()))
		) return false;
		if (building.position.shape.width === 1 &&
			(!middleRightTile.isPresent() || !this.canBuild(middleRightTile.get()))
		) return false;
		if (building.position.shape.height === 1 &&
			(!bottomCenterTile.isPresent() || !this.canBuild(bottomCenterTile.get()))
		) return false;

		return true;
	}

	private mapTerrainMatrixToTileMatrix(terrainMatrix: Matrix<TerrainTile>): Matrix<Tile> {
		return terrainMatrix.map((terrainTile, position) => new Tile(
			position,
			terrainTile.surface,
			terrainTile.biome,
			terrainTile.isPlant,
			terrainTile.isSnow,
			Maybe.empty(),
			Maybe.empty(),
			Maybe.empty()
		));
	}

	/**
	 * City can be placed only on land surface
	 * @param tilemap
	 * @param position
	 */
	private canPlaceCity(tilemap: Matrix<TerrainTile>, position: Position) {
		return tilemap.has(position) && tilemap.at(position).surface.type === 'land';
	}

}
