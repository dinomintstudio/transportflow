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

	add(position: Position): Position {
		return new Position(this.x + position.x, this.y + position.y);
	}

	sub(position: Position): Position {
		return this.add(position.negate());
	}

	negate(): Position {
		return new Position(-this.x, -this.y);
	}

	floor(): Position {
		return new Position(Math.floor(this.x), Math.floor(this.y));
	}

	toString(): string {
		return `[${this.x}, ${this.y}]`;
	}

}
