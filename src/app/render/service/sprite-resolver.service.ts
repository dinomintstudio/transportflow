import {Injectable} from '@angular/core'
import {SpriteResolver} from '../model/SpriteResolver'
import {Tile} from '../../game-logic/model/Tile'
import {Maybe} from '../../common/model/Maybe'
import {Shape} from '../../common/model/Shape'
import {Matrix} from '../../common/model/Matrix'
import {Position} from '../../common/model/Position'

/**
 * Service responsible for providing sprite resolvers - functions that responsible for matching tile to a specific
 * sprite name
 */
@Injectable({
	providedIn: 'root'
})
export class SpriteResolverService {

	/**
	 * Array of sprite resolvers
	 */
	mapSpriteResolvers: SpriteResolver[] = [
		new SpriteResolver((t) => this.getSurfaceSprite(t)),
		new SpriteResolver((t) => this.getBuildingSprite(t)),
		new SpriteResolver((t, a) => this.getRoadSprite(t, a), true),
		new SpriteResolver((t) => this.getPlantSprite(t)),
		new SpriteResolver((t) => this.getBorderSprite(t)),
	]

	/**
	 * Array of sprite resolvers
	 */
	miniMapSpriteResolvers: SpriteResolver[] = [
		new SpriteResolver((t) => this.getSurfaceSprite(t)),
		new SpriteResolver((t) => this.getBuildingSprite(t)),
		new SpriteResolver((t, a) => this.getRoadSprite(t, a), true),
	]

	getSurfaceSprite(tile: Tile): Maybe<string> {
		let surface: string = tile.surface.type === 'land' ? tile.biome.type : tile.surface.type
		if (tile.isSnow) surface = 'snow'
		return new Maybe(surface)
	}

	private getBorderSprite(_): Maybe<string> {
		return new Maybe('border')
	}

	private getBuildingSprite(tile: Tile): Maybe<string> {
		if (tile.building.isPresent() && tile.building.get().position.topLeft.equals(tile.position)) {
			const buildingShape: Shape = tile.building.get().position.shape
			return new Maybe(
				`house_${buildingShape.width + 1}x${buildingShape.height + 1}`
			)
		}
		return Maybe.empty()
	}

	private getRoadSprite(tile: Tile, adjacentTiles: Matrix<Maybe<Tile>>): Maybe<string> {
		if (tile.road.isPresent()) {
			const adjacentRoads: Matrix<Boolean> = adjacentTiles.map(t => t.isPresent() && t.get().road.isPresent())
			let sprite = `road_${
				(adjacentRoads.at(new Position(1, 0)) ? 'n' : '') +
				(adjacentRoads.at(new Position(2, 1)) ? 'e' : '') +
				(adjacentRoads.at(new Position(1, 2)) ? 's' : '') +
				(adjacentRoads.at(new Position(0, 1)) ? 'w' : '')
			}`
			return new Maybe(sprite)
		}
		return Maybe.empty()
	}

	private getPlantSprite(tile: Tile): Maybe<string> {
		if (tile.isPlant) {
			return new Maybe('tree')
		}
		return Maybe.empty()
	}

}
