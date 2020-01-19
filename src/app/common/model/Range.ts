/**
 * Numeric range of any kind of value
 */
export class Range {

	/**
	 * Lowest value in range
	 */
	from: number;

	/**
	 * Highest value in range
	 */
	to: number;

	/**
	 * Construct new Range instance
	 * @param from from value
	 * @param to to value
	 */
	constructor(from: number, to: number) {
		this.from = from;
		this.to = to;
	}

	/**
	 * Checks whether given value is in range
	 * @param value value
	 */
	in(value: number): Boolean {
		return value >= this.from && value <= this.to;
	}

	/**
	 * Delta value (distance) of range
	 */
	delta(): number {
		return this.to - this.from;
	}

	/**
	 * Map certain value [0, 1] to range
	 * @param value value
	 */
	map(value: number): number {
		return value * (this.to - this.from) + this.from;
	}

	/**
	 * Returns a number clamped by range
	 * @param value value
	 */
	clamp(value: number): number {
		return Math.min(Math.max(value, this.from), this.to);
	}

	/**
	 * Weather two ranges have common values
	 * @param r1 range
	 * @param r2 range
	 */
	static areIntersect(r1: Range, r2: Range): Boolean {
		return r2.in(r1.from) || r2.in(r1.to) ||
			r1.in(r2.from) || r1.in(r2.to);
	}

}
