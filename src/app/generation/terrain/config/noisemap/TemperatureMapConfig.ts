import {NoiseConfig} from "../../../math/config/NoiseConfig";

/**
 * Options for altitude noise map generation
 */
export class TemperatureMapConfig {

	/**
	 * Noise config
	 */
	noiseConfig: NoiseConfig;

	/**
	 * Land fraction. How many parts of land will be in generated terrain
	 */
	landFraction: number;

	/**
	 * Snow fraction. How many parts of snow will be in generated terrain
	 */
	snowFraction: number;

	/**
	 * Constructs config
	 * @param noiseConfig
	 * @param landFraction
	 * @param snowFraction
	 */
	constructor(noiseConfig: NoiseConfig, landFraction: number, snowFraction: number) {
		this.noiseConfig = noiseConfig;
		this.landFraction = landFraction;
		this.snowFraction = snowFraction;
	}

}