import {Injectable} from '@angular/core';
import {Range} from "../../../common/model/Range";

@Injectable({
	providedIn: 'root'
})
export class FractionService {

	constructor() {
	}

	calculateRanges(fractions: number[]): Range[] {
		const cumulativeSum = [];
		fractions.reduce((a, b, i) => {
			return cumulativeSum[i] = a + b;
		}, 0);

		const sum = cumulativeSum[cumulativeSum.length - 1];

		return cumulativeSum.map((fr, i) => {
			if (i === 0) {
				return new Range(0, fr / sum);
			} else {
				return new Range(cumulativeSum[i - 1] / sum, fr / sum);
			}
		})
	}

	in(ranges: Range[], value: number): number {
		for (let i = 0; i < ranges.length; i++) {
			if (ranges[i].in(value)) return i;
		}
	}

}
