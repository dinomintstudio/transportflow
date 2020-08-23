import {Shape} from '../../../common/model/Shape'
import {Rectangle} from '../../../common/model/Rectangle'
import {Matrix} from '../../../common/model/Matrix'
import {Position} from '../../../common/model/Position'
import {Canvas, createCanvas} from './Canvas'
import {SingleCanvas} from './SingleCanvas'

/**
 * Canvas implementation that combine a matrix `SingleCanvas` to act like a single large canvas.
 * Each single canvas is called a "chunk".
 * Used to bypass canvas size limitation, optimize rendering by drawing/updating only needed chunks
 */
export class ChunkedCanvas implements Canvas {

	/**
	 * Resolution of chunk matrix
	 */
	resolution: Shape

	/**
	 * Chunk matrix
	 */
	chunkMatrix: Matrix<SingleCanvas>

	/**
	 * Chunk size in tiles per side.
	 * Always squared (has resolution of `n` by `n`)
	 */
	chunkSize: number

	/**
	 * Initialize canvas and generate chunk matrix
	 * @param resolution
	 * @param chunkSize
	 */
	constructor(resolution: Shape, chunkSize: number) {
		this.resolution = resolution
		this.chunkSize = chunkSize
		this.generateChunkMatrix()
	}

	/**
	 * Draw an image on canvas.
	 * Abstracts drawing on multiple canvases like it is a single one
	 * @param image
	 * @param destinationRect
	 * @param sourceRect
	 */
	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void {
		if (!sourceRect) {
			sourceRect = Rectangle.rectangleByOnePoint(
				Position.ZERO,
				new Shape(<number>image.width, <number>image.height)
			)
		}

		const chunkPosition: Position = destinationRect.topLeft.map(c =>
			Math.floor(c / this.chunkSize)
		)

		const chunk: SingleCanvas = this.chunkMatrix.at(chunkPosition)
		// TODO: check if drawing is required
		chunk.drawImage(
			image,
			Rectangle.rectangleByOnePoint(
				destinationRect.topLeft.sub(
					chunkPosition.map(c => c * this.chunkSize)
				),
				destinationRect.shape
			),
			sourceRect
		)
	}

	/**
	 * Initialize matrix with canvases
	 */
	private generateChunkMatrix() {
		this.chunkMatrix = new Matrix<SingleCanvas>(
			this.resolution.map(c => Math.floor((c - 1) / this.chunkSize) + 1),
			null,
			() => new SingleCanvas(createCanvas(Shape.square(this.chunkSize)), true)
		)
	}

	/**
	 * Get part of canvas.
	 * Abstracts getting part from multiple canvases like it is a single one
	 * @param rectangle
	 */
	of(rectangle: Rectangle): HTMLCanvasElement {
		const result: HTMLCanvasElement = createCanvas()
		result.width = rectangle.shape.width
		result.height = rectangle.shape.height
		const resultContext: CanvasRenderingContext2D = result.getContext('2d')

		const visibleChunksRect = Rectangle.rectangleByTwoPoints(
			rectangle.topLeft.map(c => Math.floor(c / this.chunkSize)),
			rectangle.bottomRight.map(c => Math.floor(c / this.chunkSize) + 1),
		)

		this.chunkMatrix.of(visibleChunksRect).forEach((canvas, position) => {
			if (!canvas) return

			const mappedDestinationPosition: Position = rectangle.topLeft.sub(position
				.add(visibleChunksRect.topLeft).map(c => c * this.chunkSize)
			)

			resultContext.imageSmoothingEnabled = false
			resultContext.drawImage(
				canvas.canvas,
				mappedDestinationPosition.x,
				mappedDestinationPosition.y,
				result.width,
				result.height,
				0,
				0,
				rectangle.shape.width,
				rectangle.shape.height,
			)
		})

		return result
	}

	/**
	 * Draw part of canvas on some part of another one.
	 * Abstracts getting part from multiple canvases like it is a single one
	 * @param rectangle
	 * @param destCanvas
	 * @param destinationRect
	 */
	drawPartOn(rectangle: Rectangle, destCanvas: SingleCanvas, destinationRect: Rectangle): void {
		const visibleChunksRect = Rectangle.rectangleByTwoPoints(
			rectangle.topLeft.map(c => Math.floor(c / this.chunkSize)),
			rectangle.bottomRight.map(c => Math.floor(c / this.chunkSize) + 1),
		)

		this.chunkMatrix
			.of(visibleChunksRect)
			.forEach((canvas, position) => {
				if (!canvas) return

				const mappedDestinationPosition: Position = rectangle.topLeft.sub(
					position
						.add(visibleChunksRect.topLeft)
						.map(c => c * this.chunkSize)
				)

				destCanvas.drawImage(
					canvas.canvas,
					Rectangle.rectangleByOnePoint(
						destinationRect.topLeft,
						new Shape(
							destCanvas.canvas.width,
							destCanvas.canvas.height
						)
					),
					Rectangle.rectangleByOnePoint(
						mappedDestinationPosition,
						rectangle.shape
					)
				)
			})
	}

}
