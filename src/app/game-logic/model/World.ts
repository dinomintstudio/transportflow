import {Matrix} from "../../common/model/Matrix";
import {Tile} from "./Tile";
import {WorldGenerationConfig} from "../../generation/world/config/WorldGenerationConfig";

export class World {

	tilemap: Matrix<Tile>;
	worldGenerationConfig: WorldGenerationConfig;

}