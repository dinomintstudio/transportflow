import {Range} from "../../common/model/Range";

// TODO: docs
export class NoiseConfig {
	scale: number;
	range: Range;

	constructor(scale: number = 1, range: Range = new Range(0, 1)) {
		this.scale = scale;
		this.range = range;
	}
}