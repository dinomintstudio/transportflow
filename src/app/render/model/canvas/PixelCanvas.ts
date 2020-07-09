import {Shape} from '../../../common/model/Shape'
import {Position} from '../../../common/model/Position'

/**
 * Wrapper around `HTMLCanvasElement`, specified on drawing pixel individually
 */
export class PixelCanvas {

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

	/**
	 * Set single pixel color at specified position
	 * @param position
	 * @param color
	 */
	drawPixel(position: Position, color: string): void {
		this.context.fillStyle = color
		this.context.fillRect(position.x, position.y, 1, 1)
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
	 * @param color
	 */
	drawBorder(color: string): void {
		this.context.lineWidth = 1
		this.context.strokeStyle = color
		this.context.strokeRect(0, 0, this.resolution.width, this.resolution.height)
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

}

