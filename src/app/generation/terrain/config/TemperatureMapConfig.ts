import {NoiseConfig} from "../../math/config/NoiseConfig";

export class TemperatureMapConfig {

	noiseConfig: NoiseConfig;

	landFraction: number;

	snowFraction: number;

	constructor(noiseConfig: NoiseConfig, landFraction: number, snowFraction: number) {
		this.noiseConfig = noiseConfig;
		this.landFraction = landFraction;
		this.snowFraction = snowFraction;
	}

}