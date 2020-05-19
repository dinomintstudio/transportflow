import {Injectable} from '@angular/core'
import seedrandom from 'seedrandom'
import {Range} from '../model/Range'
import {ObservableData} from '../model/ObservableData'

import uuidv4 from 'uuid/v4'
import {Log} from '../model/Log'

/**
 * Service that responsible for PRNG (Pseudorandom number generation) within the application. It uses `seedrandom`
 * library
 */
@Injectable({
	providedIn: 'root'
})
export class RandomService {

	log: Log = new Log(this)

	seed: ObservableData<string>
	/**
	 * `seedrandom` instance of PRNG
	 */
	private generator = seedrandom()

	/**
	 * Construct service
	 */
	constructor() {
		const seed = uuidv4().slice(0, 4)
		this.log.debug(`until seed not provided, using generated one: ${seed}`)
		this.seed = new ObservableData<string>(seed)
		this.seed.observable.subscribe(s => {
			this.log.debug(`PRNG use seed: ${s}`)
			this.generator = seedrandom(s)
		})
	}

	/**
	 * Returns pseudorandom floating point number from 0 to 1
	 */
	random(): number {
		return this.generator()
	}

	/**
	 * Returns pseudorandom floating point number from range
	 * @param range range
	 */
	randomRange(range: Range): number {
		return this.random() * (range.to - range.from) + range.from
	}

	/**
	 * Returns pseudorandom integer number from range
	 * @param range range
	 */
	randomRangeInteger(range: Range): number {
		return Math.floor(this.randomRange(range))
	}

	/**
	 * Return `true` with specified probability
	 * @param probability chance of getting true. Between `[0, 1]`
	 */
	withProbability(probability: number): Boolean {
		return this.random() < probability
	}

}
