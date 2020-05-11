import {DesertBiomeConfig} from './DesertBiomeConfig'
import {TaigaBiomeConfig} from './TaigaBiomeConfig'
import {JungleBiomeConfig} from './JungleBiomeConfig'

/**
 * Generation configuration for all biomes
 */
export class BiomesConfig {

	desertBiomeConfig: DesertBiomeConfig
	taigaBiomeConfig: TaigaBiomeConfig
	jungleBiomeConfig: JungleBiomeConfig

	constructor(desertBiomeConfig: DesertBiomeConfig = new DesertBiomeConfig(), taigaBiomeConfig: TaigaBiomeConfig = new TaigaBiomeConfig(), jungleBiomeConfig: JungleBiomeConfig = new JungleBiomeConfig()) {
		this.desertBiomeConfig = desertBiomeConfig
		this.taigaBiomeConfig = taigaBiomeConfig
		this.jungleBiomeConfig = jungleBiomeConfig
	}

}