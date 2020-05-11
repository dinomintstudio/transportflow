import {Rectangle} from '../Rectangle'
import {Shape} from '../Shape'

export interface Canvas {

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void;

}

export const createCanvas = (resolution?: Shape): HTMLCanvasElement => {
	const canvas: HTMLCanvasElement = document.createElement('canvas')
	if (resolution) {
		canvas.width = resolution.width
		canvas.height = resolution.height
	}
	return canvas
}
