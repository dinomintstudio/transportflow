import {BiomeConfig} from "./BiomeConfig";

export class DesertBiomeConfig implements BiomeConfig {

	plantK: number;

	constructor(plantK: number = 1) {
		this.plantK = plantK;
	}

}