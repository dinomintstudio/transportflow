import {BiomeConfig} from './BiomeConfig'

export class JungleBiomeConfig implements BiomeConfig {

	plantK: number

	constructor(plantK: number = 1) {
		this.plantK = plantK
	}

}