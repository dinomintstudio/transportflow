/**
 * Characteristic of an object that has position represented by x and y
 */
export class Position {

	/**
	 * x coordinate
	 */
	x: number;

	/**
	 * y coordinate
	 */
	y: number;

	/**
	 * Construct new Position instance
	 * @param x x coordinate
	 * @param y y coordinate
	 */
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

}