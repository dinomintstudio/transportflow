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

		return cumulativeSum.map((fr, i) => {
			if (i === 0) {
				return new Range(0, fr);
			} else {
				return new Range(fr, cumulativeSum[i + 1]);
			}
		})
	}

	in(ranges: Range[], value: number): number {
		for (let i = 0; i < ranges.length; i++) {
			if (ranges[i].in(value)) return i;
		}
	}

}
