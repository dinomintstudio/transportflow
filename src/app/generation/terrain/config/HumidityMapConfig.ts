import {NoiseConfig} from "../../math/config/NoiseConfig";

export class HumidityMapConfig {

	noiseConfig: NoiseConfig;

	taigaFraction: number;

	desertFraction: number;

	jungleFraction: number;

	constructor(noiseConfig: NoiseConfig, taigaFraction: number, desertFraction: number, jungleFraction: number) {
		this.noiseConfig = noiseConfig;
		this.taigaFraction = taigaFraction;
		this.desertFraction = desertFraction;
		this.jungleFraction = jungleFraction;
	}

}