import {Injectable} from '@angular/core';
import {RandomService} from "../../../random/service/random.service";
import {NoiseConfig} from "../config/NoiseConfig";
import {Position} from "../../../common/model/Position";
import * as SimplexNoise from "simplex-noise";
import {Range} from "../../../common/model/Range";

@Injectable({
	providedIn: 'root'
})
export class NoiseService {

	constructor(
		private randomService: RandomService
	) {
	}

	generate(position: Position, config: NoiseConfig): number {
		const simplexNoise = this.randomService.seed
			? new SimplexNoise(this.randomService.seed)
			: new SimplexNoise();

		// getting value in range of [-sqrt(n)/2, sqrt(n)/2]
		let noiseValue = simplexNoise.noise2D(position.x * config.scale, position.y * config.scale);

		// mapping it to range [0, 1]
		noiseValue = (noiseValue + 1) / 2;

		return Range.map(noiseValue, config.range);
	}

}
