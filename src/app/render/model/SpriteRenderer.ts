import {Tile} from "../../game-logic/model/Tile";
import {Matrix} from "../../common/model/Matrix";
import {Maybe} from "../../common/model/Maybe";

export class SpriteRenderer {

	getSprite: (tile: Tile, adjacentTiles: Matrix<Maybe<Tile>>) => Maybe<HTMLImageElement>;
	needAdjacentTiles: boolean;

	constructor(getSprite: (tile: Tile, adjacentTiles?: Matrix<Maybe<Tile>>) => Maybe<HTMLImageElement>, needAdjacentTiles: boolean = false) {
		this.getSprite = getSprite;
		this.needAdjacentTiles = needAdjacentTiles;
	}

}
