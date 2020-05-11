/**
 * Describes in-game biome
 */
import {BiomeConfig} from '../../generation/terrain/config/biome/BiomeConfig'

export class Biome {

	/**
	 * Biome type
	 */
	type: 'taiga' | 'desert' | 'jungle'

	/**
	 * Config by which biome was created
	 */
	config: BiomeConfig

	/**
	 * Constructs new Biome instance
	 * @param type biome type. Null by default
	 * @param config
	 */
	constructor(type: 'taiga' | 'desert' | 'jungle' = null, config: BiomeConfig) {
		this.type = type
		this.config = config
	}
}