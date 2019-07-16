import {Matrix} from "../../../common/model/Matrix";
import {TerrainTile} from "./TerrainTile";

/**
 * Generated tiled terrain. Output of terrain generator
 */
export class TiledTerrain {

	/**
	 * Tilemap of terrain tiles
	 */
	tilemap: Matrix<TerrainTile>;

	/**
	 * Constructs new TiledTerrain instance
	 * @param tilemap
	 */
	constructor(tilemap: Matrix<TerrainTile> = new Matrix()) {
		this.tilemap = tilemap;
	}
}