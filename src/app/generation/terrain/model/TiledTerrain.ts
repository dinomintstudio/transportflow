import {Matrix} from "../../../common/model/Matrix";
import {TerrainTile} from "./TerrainTile";
import {Position} from "../../../common/model/Position";

/**
 * Generated tiled terrain. Output of terrain generator
 */
export class TiledTerrain {

	/**
	 * Tilemap of terrain tiles
	 */
	tilemap: Matrix<TerrainTile>;

	/**
	 * Initial positions of cities
	 */
	cityPoints: Position[];

	/**
	 * Constructs new TiledTerrain instance
	 * @param tilemap
	 * @param cityPoints
	 */
	constructor(tilemap: Matrix<TerrainTile> = new Matrix(), cityPoints: Position[] = []) {
		this.tilemap = tilemap;
		this.cityPoints = cityPoints;
	}
}