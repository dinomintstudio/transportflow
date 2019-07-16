import {NoiseConfig} from "../../../math/config/NoiseConfig";

/**
 * Options for altitude noise map generation
 */
export class AltitudeMapConfig {

	/**
	 * Noise config
	 */
	noiseConfig: NoiseConfig;

	/**
	 * Water fraction. How many parts of water will be in generated terrain
	 */
	waterFraction: number;

	/**
	 * Land fraction. How many parts of land will be in generated terrain
	 */
	landFraction: number;

	/**
	 * Mountain fraction. How many parts of mountain will be in generated terrain
	 */
	mountainFraction: number;

	/**
	 * Constructs config
	 * @param noiseConfig
	 * @param waterFraction
	 * @param landFraction
	 * @param mountainFraction
	 */
	constructor(noiseConfig: NoiseConfig, waterFraction: number, landFraction: number, mountainFraction: number) {
		this.noiseConfig = noiseConfig;
		this.waterFraction = waterFraction;
		this.landFraction = landFraction;
		this.mountainFraction = mountainFraction;
	}

}