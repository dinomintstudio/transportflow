import {Surface} from "../../../game-logic/model/Surface";
import {Maybe} from "../../../common/model/Maybe";
import {Biome} from "../../../game-logic/model/Biome";

/**
 * Terrain tile. Output of terrain generator
 */
export class TerrainTile {

	/**
	 * Surface of tile
	 */
	surface: Surface;

	/**
	 * Biome of tile
	 */
	biome: Biome;

	/**
	 * Is tile covered in snow
	 */
	isSnow: Boolean;

	/**
	 * Is tile contain plant
	 */
	isPlant: Boolean;

	/**
	 * Is tile is a starting position of a city
	 */
	isCity: Boolean;

}