import {Surface} from "./Surface";
import {Building} from "./Building";
import {RoadTile} from "./RoadTile";
import {Maybe} from "../../common/model/Maybe";
import {Biome} from "./Biome";
import {TiledCity} from "../../generation/city/model/TiledCity";
import {Position} from "../../common/model/Position";

export class Tile {

	position: Position;
	surface: Surface;
	biome: Biome;
	isPlant: Boolean;
	isSnow: Boolean;
	city: Maybe<TiledCity>;
	building: Maybe<Building>;
	road: Maybe<RoadTile>;

	constructor(position: Position, surface: Surface, biome: Biome, isPlant: Boolean, isSnow: Boolean, city: Maybe<TiledCity>, building: Maybe<Building>, road: Maybe<RoadTile>) {
		this.position = position;
		this.surface = surface;
		this.biome = biome;
		this.isPlant = isPlant;
		this.isSnow = isSnow;
		this.city = city;
		this.building = building;
		this.road = road;
	}

}
