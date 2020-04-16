/**
 * Characteristic of an object that has width and height
 */
export class Shape {

	/**
	 * Construct new Shape instance
	 * @param width object width
	 * @param height object height
	 */
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	/**
	 * Width of an object
	 */
	width: number;

	/**
	 * Height of an object
	 */
	height: number;

	/**
	 * Calculates shape area
	 */
	area(): number {
		return this.width * this.height;
	}

	/**
	 * Map each side with mapping function
	 */
	map(mapFunction: (side: number) => number): Shape {
		return new Shape(mapFunction(this.width), mapFunction(this.height));
	}

	toString(): string {
		return `[${this.width}x${this.height}]`;
	}

	static square(sideLength: number): Shape {
		return new Shape(sideLength, sideLength);
	}

}
