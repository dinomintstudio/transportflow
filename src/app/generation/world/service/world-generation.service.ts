import {Injectable} from '@angular/core'
import {TiledTerrain} from '../../terrain/model/TiledTerrain'
import {WorldGenerationConfig} from '../config/WorldGenerationConfig'
import {World} from '../../../game-logic/model/World'
import {Matrix} from '../../../common/model/Matrix'
import {Tile} from '../../../game-logic/model/Tile'
import {TiledCity} from '../../city/model/TiledCity'
import {Position} from '../../../common/model/Position'
import {Maybe} from '../../../common/model/Maybe'
import {Building} from '../../../game-logic/model/Building'
import {RoadTile} from '../../../game-logic/model/RoadTile'
import {Road} from '../../../game-logic/model/Road'
import {TerrainTile} from '../../terrain/model/TerrainTile'
import {Log} from '../../../common/model/Log'
import {CityGenerationService} from '../../city/service/city-generation.service'
import {WorldService} from '../../../game-logic/service/world.service'

@Injectable({
	providedIn: 'root'
})
export class WorldGenerationService {

	log: Log = new Log(this)

	constructor(
		private cityGenerationService: CityGenerationService,
		private worldService: WorldService
	) {}

	/**
	 * Generate terrain and natural structures
	 * @param tiledTerrain
	 * @param config
	 */
	generate(tiledTerrain: TiledTerrain, config: WorldGenerationConfig): World {
		this.log.debug('generate world')
		const tilemap: Matrix<Tile> = this.mapTerrainMatrixToTileMatrix(tiledTerrain.tilemap)

		tiledTerrain.cityPoints
			.filter(p => this.canPlaceCity(tiledTerrain.tilemap, p))
			.forEach(cityPosition => {
				const city: TiledCity = this.cityGenerationService.generate(config.cityGenerationConfig)
				// place cityPoint in the center of city tilemap
				const worldCityPosition: Position = cityPosition.add(
					Position
						.fromShape(city.tilemap.shape.map(c => -c / 2))
						.floor()
				)

				this.fillCityTile(city, worldCityPosition, tilemap)
				this.placeBuildings(city, worldCityPosition, tilemap)
			})

		return new World(
			tilemap,
			config
		)
	}

	private placeBuildings(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.generatedCityTemplate.buildings.forEach((building) => {
			const worldTilePosition: Position = worldCityPosition.add(building.position.topLeft)
			building.position = building.position.translate(worldCityPosition)
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return
			const worldTile: Tile = tilemap.at(worldTilePosition)

			const adjacentTileMatrix = this.worldService.getAdjacentTileMatrix(tilemap, worldTilePosition)
			if (!this.canBuild(worldTile)) return
			if (!this.canBuildBuilding(building, adjacentTileMatrix)) return

			worldTile.isPlant = false
			worldTile.city = new Maybe<TiledCity>(city)
			worldTile.building = new Maybe<Building>(building)
			if (building.position.shape.height === 1) {
				adjacentTileMatrix.at(new Position(1, 2)).ifPresent(t => t.building = worldTile.building)
			}
			if (building.position.shape.width === 1) {
				adjacentTileMatrix.at(new Position(2, 1)).ifPresent(t => t.building = worldTile.building)
			}
			if (building.position.shape.area() === 1) {
				adjacentTileMatrix.at(new Position(2, 2)).ifPresent(t => t.building = worldTile.building)
			}
		})
	}

	private fillCityTile(city: TiledCity, worldCityPosition: Position, tilemap: Matrix<Tile>): void {
		city.tilemap.forEach((cityTile, position) => {
			if (!cityTile.isPresent()) return

			const worldTilePosition: Position = worldCityPosition.add(position)
			// out of world map range
			if (!tilemap.has(worldTilePosition)) return
			const worldTile: Tile = tilemap.at(worldTilePosition)

			if (!this.canBuild(worldTile)) return

			worldTile.isPlant = false
			worldTile.city = new Maybe<TiledCity>(city)

			if (cityTile.get().type == 'road') {
				worldTile.road = new Maybe<RoadTile>(new RoadTile(
					Maybe.empty(),
					new Maybe(new Road('roadway')),
					Maybe.empty()
				))
			}
		})
	}

	private canBuild(tile: Tile): Boolean {
		return tile.surface.type === 'land' && !tile.road.isPresent() && !tile.building.isPresent()
	}

	private canBuildBuilding(building: Building, adjacentTiles: Matrix<Maybe<Tile>>): Boolean {
		const centerTile = adjacentTiles.at(new Position(1, 1))
		const middleRightTile = adjacentTiles.at(new Position(2, 1))
		const bottomCenterTile = adjacentTiles.at(new Position(1, 2))
		const bottomRightTile = adjacentTiles.at(new Position(2, 2))

		if (!this.canBuild(centerTile.get())) return false
		if (building.position.shape.area() === 1 &&
			(!bottomRightTile.isPresent() || !this.canBuild(bottomRightTile.get()))
		) return false
		if (building.position.shape.width === 1 &&
			(!middleRightTile.isPresent() || !this.canBuild(middleRightTile.get()))
		) return false
		if (building.position.shape.height === 1 &&
			(!bottomCenterTile.isPresent() || !this.canBuild(bottomCenterTile.get()))
		) return false

		return true
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
		))
	}

	/**
	 * City can be placed only on land surface
	 * @param tilemap
	 * @param position
	 */
	private canPlaceCity(tilemap: Matrix<TerrainTile>, position: Position) {
		return tilemap.has(position) && tilemap.at(position).surface.type === 'land'
	}

}
