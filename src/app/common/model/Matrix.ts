import {Shape} from "./Shape";
import {Position} from "./Position";
import {Rectangle} from "./Rectangle";

/**
 * Library wrapper of a jagged 2d array acting as matrix data structure
 */
export class Matrix<T> {

	/**
	 * Matrix shape
	 */
	shape: Shape;

	/**
	 * Internal value. Jagged 2d array itself
	 */
	value: T[][];

	/**
	 * Constructs new Matrix instance.
	 * When both params `null` then empty matrix is constructed
	 * @param shape matrix shape. When `null` then shape is automatically calculated from given @param value
	 * @param value matrix internal value. When `null` then matrix automatically filled with nulls by given @param shape
	 */
	constructor(shape: Shape = null, value: T[][] = []) {
		this.shape = shape;
		this.value = value;

		if (!shape && !value) throw new TypeError('invalid parameters');

		if (!shape) {
			this.shape = new Shape(value[0] ? value[0].length : 0, value.length)
		}
		if (value.length === 0) {
			this.value = new Array(this.shape.height).fill([]);
			this.value.forEach((__, i) => {
				this.value[i] = new Array(this.shape.width).fill(null);
			});
		}

	}

	/**
	 * Returns element from specified position
	 * @param position element's position
	 */
	at(position: Position): T {
		return this.value[position.y][position.x];
	}

	/**
	 * Sets element in specified position
	 * @param position position to be set
	 * @param value element value
	 */
	set(position: Position, value: T) {
		if (position.x < 0 || position.x > this.shape.width ||
			position.y < 0 || position.y > this.shape.height) throw new Error('invalid position');

		this.value[position.y][position.x] = value;
	}

	/**
	 * Return submatrix of specified @param rectangle
	 * @param rectangle submatrix position and shape
	 * @param outFill if @param rectangle goes out of matrix's bound then such elements filled with it
	 */
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

	/**
	 * Maps whole matrix by specified function
	 * @param func mapping function
	 * @return mapped matrix
	 */
	map<D>(func: (t: T) => D): Matrix<D> {
		return new Matrix<D>(
			this.shape,
			this.value
				.map(row => row.map(e => func(e)))
		);
	}

}