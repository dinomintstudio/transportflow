/**
 * Characteristic of an object that has width and height
 */
import {Position} from './Position'

export class Shape {

	/**
	 * Construct new Shape instance
	 * @param width object width
	 * @param height object height
	 */
	constructor(width: number, height: number) {
		this.width = width
		this.height = height
	}

	/**
	 * Width of an object
	 */
	width: number

	/**
	 * Height of an object
	 */
	height: number

	/**
	 * Calculates shape area
	 */
	area(): number {
		return this.width * this.height
	}

	/**
	 * Map both sides with mapping function
	 */
	map(mapFunction: (side: number) => number): Shape {
		return this.mapEach(mapFunction, mapFunction)
	}

	/**
	 * Map each side with mapping function
	 */
	mapEach(widthMapFunction: (width: number) => number, heightMapFunction: (height: number) => number): Shape {
		return new Shape(widthMapFunction(this.width), heightMapFunction(this.height))
	}

	toString(): string {
		return `[${this.width}x${this.height}]`
	}

	static square(sideLength: number): Shape {
		return new Shape(sideLength, sideLength)
	}

	/**
	 * Convert position to shape
	 */
	static fromPosition(position: Position): Shape {
		return new Shape(position.x, position.y)
	}

}
