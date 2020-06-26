import {Rectangle} from '../Rectangle'
import {Shape} from '../Shape'
import {Position} from '../Position'
import {Canvas} from './Canvas'

export class SingleCanvas implements Canvas {

	canvas: HTMLCanvasElement
	resolution: Shape
	context: CanvasRenderingContext2D
	isDrawn: Boolean

	constructor(canvas: HTMLCanvasElement, alpha: boolean = false) {
		this.canvas = canvas
		this.resolution = new Shape(canvas.width, canvas.height)
		this.context = canvas.getContext('2d', {alpha: alpha})
		this.isDrawn = false
	}

	setResolution(resolution: Shape) {
		this.resolution = resolution
		this.canvas.width = resolution.width
		this.canvas.height = resolution.height
	}

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void {
		if (!sourceRect) {
			sourceRect = Rectangle.rectangleByOnePoint(
				Position.ZERO,
				new Shape(<number>image.width, <number>image.height)
			)
		}
		this.context.imageSmoothingEnabled = false
		this.context.drawImage(
			image,
			sourceRect.topLeft.x,
			sourceRect.topLeft.y,
			sourceRect.shape.width,
			sourceRect.shape.height,
			destinationRect.topLeft.x,
			destinationRect.topLeft.y,
			destinationRect.shape.width,
			destinationRect.shape.height,
		)
		this.isDrawn = true
	}

	fill(color: string): void {
		this.context.fillStyle = color
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	drawBorder(strokeWidth: number, color: string): void {
		this.context.lineWidth = strokeWidth
		this.context.strokeStyle = color
		this.context.strokeRect(0, 0, this.resolution.width, this.resolution.height)
	}

	compose(...canvases: SingleCanvas[]): void {
		canvases.forEach(canvas => {
			this.drawImage(
				canvas.canvas,
				Rectangle.rectangleByOnePoint(
					Position.ZERO,
					this.resolution
				)
			)
		})
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

}

