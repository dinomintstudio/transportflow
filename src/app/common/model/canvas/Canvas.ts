import {Rectangle} from '../Rectangle'
import {Shape} from '../Shape'

/**
 * Interface for custom canvas for drawing using domain entities such as `Rectangle`
 */
export interface Canvas {

	/**
	 * Draw `sourceRect` part of `image` onto `destinationRect` of canvas
	 * @param image to be drawn
	 * @param destinationRect where image will be drawn
	 * @param sourceRect part of image to be drawn
	 */
	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void;

}

/**
 * Create canvas for drawing off-screen
 * @param resolution canvas size
 */
export const createCanvas = (resolution?: Shape): HTMLCanvasElement => {
	const canvas: HTMLCanvasElement = document.createElement('canvas')
	if (resolution) {
		canvas.width = resolution.width
		canvas.height = resolution.height
	}
	return canvas
}
