import {NoiseConfig} from '../../../../util/config/NoiseConfig'

/**
 * Options for humidity noise map generation
 */
export class HumidityMapConfig {

	/**
	 * Noise config
	 */
	noiseConfig: NoiseConfig

	/**
	 * Taiga fraction. How many parts of taiga biome will be in generated terrain
	 */
	taigaFraction: number

	/**
	 * Desert fraction. How many parts of desert biome will be in generated terrain
	 */
	desertFraction: number

	/**
	 * Jungle fraction. How many parts of jungle biome will be in generated terrain
	 */
	jungleFraction: number

	/**
	 * Constructs config
	 * @param noiseConfig
	 * @param taigaFraction
	 * @param desertFraction
	 * @param jungleFraction
	 */
	constructor(noiseConfig: NoiseConfig, taigaFraction: number, desertFraction: number, jungleFraction: number) {
		this.noiseConfig = noiseConfig
		this.taigaFraction = taigaFraction
		this.desertFraction = desertFraction
		this.jungleFraction = jungleFraction
	}

}