import {NoiseConfig} from "../../math/config/NoiseConfig";

export class AltitudeMapConfig {

	noiseConfig: NoiseConfig;

	waterFraction: number;

	landFraction: number;

	mountainFraction: number;

	constructor(noiseConfig: NoiseConfig, waterFraction: number, landFraction: number, mountainFraction: number) {
		this.noiseConfig = noiseConfig;
		this.waterFraction = waterFraction;
		this.landFraction = landFraction;
		this.mountainFraction = mountainFraction;
	}

}