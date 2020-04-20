/**
 * Characteristic of an object that has position represented by x and y
 */
import {Shape} from "./Shape";

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

	/**
	 * Map both coordinates with mapping function
	 */
	map(mapFunction: (coordinate: number) => number): Position {
		return this.mapEach(mapFunction, mapFunction);
	}

	/**
	 * Map each coordinate with mapping function
	 */
	mapEach(xMapFunction: (x: number) => number, yMapFunction: (y: number) => number): Position {
		return new Position(xMapFunction(this.x), yMapFunction(this.y));
	}

	floor(): Position {
		return new Position(Math.floor(this.x), Math.floor(this.y));
	}

	equals(position: Position): Boolean {
		return this.x === position.x && this.y === position.y;
	}

	toString(): string {
		return `[${this.x}, ${this.y}]`;
	}

	static ZERO: Position = new Position(0, 0);

	/**
	 * Returns distance between two points
	 * @param p1 one point
	 * @param p2 another point
	 * @return distance between points
	 */
	static distance(p1, p2): number {
		return Math.hypot(p2.x - p1.x, p2.y - p1.y);
	}

	static fromShape(shape: Shape): Position {
		return new Position(shape.width, shape.height);
	}

}
