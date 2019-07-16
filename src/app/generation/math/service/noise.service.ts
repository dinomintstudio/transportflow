import {Injectable} from '@angular/core';
import {RandomService} from "../../../random/service/random.service";
import {NoiseConfig} from "../config/NoiseConfig";
import {Position} from "../../../common/model/Position";
import * as SimplexNoise from "simplex-noise";
import {Range} from "../../../common/model/Range";

/**
 * Responsible for generating simplex noise
 */
@Injectable({
	providedIn: 'root'
})
export class NoiseService {

	/**
	 * Simplex noise library instance
	 */
	private simplexNoise;

	/**
	 * Constructs service
	 */
	constructor(
		private randomService: RandomService
	) {
		this.randomService.seed.observable.subscribe(seed => {
			this.simplexNoise = seed
				? new SimplexNoise(seed)
				: new SimplexNoise();
		});
	}

	/**
	 * Generate simplex noise
	 * @param position position
	 * @param config noise config
	 */
	generate(position: Position, config: NoiseConfig): number {
		// getting value in range of [-sqrt(n)/2, sqrt(n)/2]
		let noiseValue = this.simplexNoise.noise2D(position.x * config.scale, position.y * config.scale);

		// mapping it to range [0, 1]
		noiseValue = (noiseValue + 1) / 2;

		return Range.map(noiseValue, config.range);
	}

}
