/**
 * Characteristic of an object that has width and height
 */
export class Shape {

	/**
	 * Width of an object
	 */
	width: number;

	/**
	 * Height of an object
	 */
	height: number;

	/**
	 * Construct new Shape instance
	 * @param width object width
	 * @param height object height
	 */
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

}