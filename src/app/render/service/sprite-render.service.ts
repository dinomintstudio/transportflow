import {Injectable} from '@angular/core'
import {SpriteRenderer} from '../model/SpriteRenderer'
import {Tile} from '../../game-logic/model/Tile'
import {Maybe} from '../../common/model/Maybe'
import {Shape} from '../../common/model/Shape'
import {Matrix} from '../../common/model/Matrix'
import {Position} from '../../common/model/Position'

/**
 * Service responsible for providing sprite renderers - functions that responsible for rendering of a specific sprite
 */
@Injectable({
	providedIn: 'root'
})
export class SpriteRenderService {

	/**
	 * Array of sprite renderers
	 */
	spriteRenderers: SpriteRenderer[] = [
		new SpriteRenderer((t) => this.getSurfaceSprite(t)),
		new SpriteRenderer((t) => this.getBuildingSprite(t)),
		new SpriteRenderer((t, a) => this.getRoadSprite(t, a), true),
		new SpriteRenderer((t) => this.getPlantSprite(t)),
		new SpriteRenderer((t) => this.getBorderSprite(t)),
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
