import {Shape} from "./Shape";
import {Position} from "./Position";
import {Rectangle} from "./Rectangle";

export class Matrix<T> {

	shape: Shape;
	value: T[][];

	constructor(shape: Shape = null, value: T[][] = []) {
		this.shape = shape;
		this.value = value;

		if (!shape && !value) throw new TypeError('invalid parameters');

		if (!shape) {
			this.shape = new Shape(value[0] ? value[0].length : 0, value.length)
		}
		if (value.length === 0) {
			this.value = new Array(this.shape.height).fill(new Array(this.shape.width).fill(null));
		}
	}

	at(position: Position): T {
		return this.value[position.x][position.y];
	}

	set(position: Position, value: T) {
		if (position.x < 0 || position.x > this.shape.width ||
			position.y < 0 || position.y > this.shape.height) throw new Error('invalid position');

		this.value[position.y][position.x] = value;
	}

	of(rectangle: Rectangle, outFill: T = null): Matrix<T> {
		const result = new Matrix<T>(rectangle.shape);

		for (let i = rectangle.topLeft.y; i <= rectangle.bottomRight.y; i++) {
			for (let j = rectangle.topLeft.x; j <= rectangle.bottomRight.x; j++) {
				if (this.value[i] && this.value[i][j]) {
					result[i][j] = this.value[i][j];
				} else {
					result[i][j] = outFill;
				}
			}
		}

		return result;
	}

	map<D>(func: (t: T) => D): Matrix<D> {
		return new Matrix<D>(
			this.shape,
			this.value
				.map(row => row.map(e => func(e)))
		);
	}

}