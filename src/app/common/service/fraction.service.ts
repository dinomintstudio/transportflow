import {Injectable} from '@angular/core'
import {Range} from '../model/Range'

/**
 * Responsible for converting fractions to corresponding range values
 * Example:
 * `1fr 2fr 1fr => [0, 0.25], [0.25, 0.75], [0.75, 1]`
 */
@Injectable({
	providedIn: 'root'
})
export class FractionService {

	constructor() {
	}

	/**
	 * Converts fractions to corresponding range values
	 * Example:
	 * `1fr 2fr 1fr => [0, 0.25], [0.25, 0.75], [0.75, 1]`
	 * @param fractions list of fractions
	 */
	calculateRanges(fractions: number[]): Range[] {
		const cumulativeSum = []
		fractions.reduce((a, b, i) => {
			return cumulativeSum[i] = a + b
		}, 0)

		const sum = cumulativeSum[cumulativeSum.length - 1]

		return cumulativeSum.map((fr, i) => {
			if (i === 0) {
				return new Range(0, fr / sum)
			} else {
				return new Range(cumulativeSum[i - 1] / sum, fr / sum)
			}
		})
	}

	/**
	 * @param ranges range list
	 * @param value value to check
	 * @return value between `[0, ranges.length - 1]` corresponding to range index in which @param value is in
	 */
	in(ranges: Range[], value: number): number {
		for (let i = 0; i < ranges.length; i++) {
			if (ranges[i].in(value)) return i
		}
	}

}
