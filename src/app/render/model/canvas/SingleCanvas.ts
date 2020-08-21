import {Rectangle} from '../../../common/model/Rectangle'
import {Shape} from '../../../common/model/Shape'
import {Position} from '../../../common/model/Position'
import {Canvas} from './Canvas'

/**
 * Basic canvas implementation.
 * Wrapper around `HTMLCanvasElement`
 */
export class SingleCanvas implements Canvas {

	/**
	 * Wrapped canvas element
	 */
	canvas: HTMLCanvasElement

	/**
	 * Canvas resolution
	 */
	resolution: Shape

	/**
	 * Canvas 2D context
	 */
	context: CanvasRenderingContext2D

	/**
	 * Whether the canvas was already used by calling `drawImage`
	 */
	isDrawn: Boolean

	/**
	 * Transparency flag.
	 * True is use alpha layer
	 */
	alpha: boolean

	/**
	 * Initialize canvas
	 * @param canvas
	 * @param alpha
	 */
	constructor(canvas: HTMLCanvasElement, alpha: boolean = false) {
		this.canvas = canvas
		this.alpha = alpha
		this.resolution = new Shape(canvas.width, canvas.height)
		this.context = canvas.getContext('2d', {alpha: alpha})
		this.isDrawn = false
	}

	/**
	 * Change canvas resolution
	 * @param resolution
	 */
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

	/**
	 * Fill canvas with a solid color
	 * @param color
	 */
	fill(color: string): void {
		this.context.fillStyle = color
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	/**
	 * Draw border around canvas
	 * @param strokeWidth
	 * @param color
	 */
	drawBorder(strokeWidth: number, color: string): void {
		this.context.lineWidth = strokeWidth
		this.context.strokeStyle = color
		this.context.strokeRect(0, 0, this.resolution.width, this.resolution.height)
	}

	drawLine(pos1, pos2, lineWidth?, color?) {
		this.context.beginPath()
		this.context.lineWidth = lineWidth
		this.context.strokeStyle = color
		this.context.moveTo(pos1.x, pos1.y)
		this.context.lineTo(pos2.x, pos2.y)
		this.context.stroke()
	}

	/**
	 * Remove canvas contents.
	 * Canvas with alpha layer will become transparent, canvas without alpha layer will become black
	 */
	clear() {
		if (this.alpha) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		} else {
			this.context.fillStyle = 'black'
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
		}
	}

	drawCircle(drawPosition: Position, radius: number, color: string): void {
		this.context.beginPath()
		this.context.fillStyle = color
		this.context.arc(drawPosition.x, drawPosition.y, radius, 0, 2 * Math.PI)
		this.context.fill()
	}

}

