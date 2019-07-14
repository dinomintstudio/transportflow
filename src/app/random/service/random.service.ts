import {Injectable} from '@angular/core';
import seedrandom from "seedrandom";
import {Range} from "../../common/model/Range";

/**
 * Service that responsible for PRNG (Pseudorandom number generation) within the application. It uses `seedrandom`
 * library
 */
@Injectable({
	providedIn: 'root'
})
export class RandomService {

	/**
	 * `seedrandom` instance of PRNG
	 */
	private generator = seedrandom();

	constructor() {
	}

	/**
	 * Sets seed for ongoing generations
	 * @param seed seed string
	 */
	setSeed(seed: string): void {
		this.generator = seedrandom(seed);
	}

	/**
	 * Returns pseudorandom floating point number from 0 to 1
	 */
	random(): number {
		return this.generator();
	}

	/**
	 * Returns pseudorandom floating point number from range
	 * @param range range
	 */
	randomRange(range: Range): number {
		return this.random() * (range.to - range.from) + range.from;
	}

	/**
	 * Returns pseudorandom integer number from range
	 * @param range range
	 */
	randomRangeInteger(range: Range): number {
		return Math.floor(this.randomRange(range));
	}

}
