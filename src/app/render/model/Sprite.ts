import {Shape} from '../../common/model/Shape'

/**
 * Describe tile image with other helpful data
 */
export class Sprite {

	/**
	 * Sprite name
	 */
	name: string

	/**
	 * Sprite image
	 */
	image: HTMLImageElement

	/**
	 * Sprite size in tiles.
	 * Most sprites are [1x1]
	 */
	tileSize: Shape

	/**
	 * Average sprite color.
	 * Used when drawing tile as a single pixel
	 */
	color: string

	constructor(name: string, image: HTMLImageElement, tileSize: Shape, color: string) {
		this.name = name
		this.image = image
		this.tileSize = tileSize
		this.color = color
	}

}
