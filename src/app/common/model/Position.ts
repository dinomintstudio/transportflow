/**
 * Characteristic of an object that has position represented by x and y
 */
import {Shape} from './Shape'

export class Position {

	/**
	 * x coordinate
	 */
	x: number

	/**
	 * y coordinate
	 */
	y: number

	/**
	 * Zero position
	 */
	static ZERO: Position = new Position(0, 0)

	/**
	 * Construct new Position instance
	 * @param x x coordinate
	 * @param y y coordinate
	 */
	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	/**
	 * Add position to current position
	 * @param position
	 */
	add(position: Position): Position {
		return new Position(this.x + position.x, this.y + position.y)
	}

	/**
	 * Sub position from current position
	 * @param position
	 */
	sub(position: Position): Position {
		return this.add(position.negate())
	}

	/**
	 * Negate both coordinates
	 */
	negate(): Position {
		return new Position(-this.x, -this.y)
	}

	/**
	 * Map both coordinates with mapping function
	 */
	map(mapFunction: (coordinate: number) => number): Position {
		return this.mapEach(mapFunction, mapFunction)
	}

	/**
	 * Map each coordinate with mapping function
	 */
	mapEach(xMapFunction: (x: number) => number, yMapFunction: (y: number) => number): Position {
		return new Position(xMapFunction(this.x), yMapFunction(this.y))
	}

	/**
	 * Floor each coordinate
	 */
	floor(): Position {
		return this.map(Math.floor)
	}

	/**
	 * Check for equality
	 * @param position
	 */
	equals(position: Position): Boolean {
		return this.x === position.x && this.y === position.y
	}

	/**
	 * String representation
	 */
	toString(): string {
		return `[${this.x}, ${this.y}]`
	}

	/**
	 * Returns distance between two points
	 * @param p1 one point
	 * @param p2 another point
	 * @return distance between points
	 */
	static distance(p1, p2): number {
		return Math.hypot(p2.x - p1.x, p2.y - p1.y)
	}

	/**
	 * Convert shape to position.
	 * Width is x, height is y
	 * @param shape
	 */
	static fromShape(shape: Shape): Position {
		return new Position(shape.width, shape.height)
	}

}
