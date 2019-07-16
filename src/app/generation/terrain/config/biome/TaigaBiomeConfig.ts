import {BiomeConfig} from "./BiomeConfig";

export class TaigaBiomeConfig implements BiomeConfig {

	plantK: number;

	constructor(plantK: number = 1) {
		this.plantK = plantK;
	}

}