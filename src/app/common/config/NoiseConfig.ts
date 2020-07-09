import {Range} from '../model/Range'

/**
 * Instructions for noise generator
 */
export class NoiseConfig {

	/**
	 * Scale of the noise map.
	 * The bigger value is - the more 'smooth' map generates. Default scale is 1
	 */
	scale: number

	/**
	 * Range of values map will be mapped to.
	 * Default range is [0, 1]
	 */
	range: Range

	/**
	 * Constructs noise config
	 * @param scale scale
	 * @param range range
	 */
	constructor(scale: number = 1, range: Range = new Range(0, 1)) {
		this.scale = scale
		this.range = range
	}
}