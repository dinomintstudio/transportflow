import {Surface} from "./Surface";
import {Building} from "./Building";
import {RoadTile} from "./RoadTile";
import {Maybe} from "../../common/model/Maybe";
import {Biome} from "./Biome";
import {TiledCity} from "../../generation/city/model/TiledCity";

export class Tile {

	surface: Surface;
	biome: Biome;
	isPlant: Boolean;
	city: Maybe<TiledCity>;
	building: Maybe<Building>;
	road: Maybe<RoadTile>;

	constructor(surface: Surface, biome: Biome, isPlant: Boolean, city: Maybe<TiledCity>, building: Maybe<Building>, road: Maybe<RoadTile>) {
		this.surface = surface;
		this.biome = biome;
		this.isPlant = isPlant;
		this.city = city;
		this.building = building;
		this.road = road;
	}

}