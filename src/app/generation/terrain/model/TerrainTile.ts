import {Surface} from "../../../game-logic/model/Surface";
import {Maybe} from "../../../common/model/Maybe";
import {Biome} from "../../../game-logic/model/Biome";

export class TerrainTile {

	surface: Surface;
	biome: Maybe<Biome>;
	isSnow: Boolean;
	isPlant: Boolean;
	isCity: Boolean;

}