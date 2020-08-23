import {Tile} from '../../game-logic/model/Tile'
import {Matrix} from '../../common/model/Matrix'
import {Maybe} from '../../common/model/Maybe'

/**
 * Handles mapping from tile (and adjacent tiles if needed) to sprite name
 */
export class SpriteResolver {

	/**
	 * Sprite supplier
	 */
	getSprite: (tile: Tile, adjacentTiles: Matrix<Maybe<Tile>>) => Maybe<string>

	/**
	 * Whether resolver need adjacent tiles or not
	 */
	needAdjacentTiles: boolean

	constructor(getSprite: (tile: Tile, adjacentTiles?: Matrix<Maybe<Tile>>) => Maybe<string>, needAdjacentTiles: boolean = false) {
		this.getSprite = getSprite
		this.needAdjacentTiles = needAdjacentTiles
	}

}
