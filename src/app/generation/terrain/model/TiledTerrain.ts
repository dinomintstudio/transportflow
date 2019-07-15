import {Matrix} from "../../../common/model/Matrix";
import {TerrainTile} from "./TerrainTile";

export class TiledTerrain {

	tilemap: Matrix<TerrainTile>;

	constructor(tilemap: Matrix<TerrainTile> = new Matrix()) {
		this.tilemap = tilemap;
	}
}