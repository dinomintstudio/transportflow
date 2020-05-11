import {Shape} from '../Shape'
import {Rectangle} from '../Rectangle'
import {Matrix} from '../Matrix'
import {Position} from '../Position'
import {Canvas, createCanvas} from './Canvas'
import {SingleCanvas} from './SingleCanvas'

export class ChunkedCanvas implements Canvas {

	resolution: Shape
	chunkMatrix: Matrix<SingleCanvas>
	chunkSize: number
	private readonly attributes: CanvasRenderingContext2DSettings

	constructor(resolution: Shape, chunkSize: number, attributes?: CanvasRenderingContext2DSettings) {
		this.resolution = resolution
		this.chunkSize = chunkSize
		this.attributes = attributes
		this.generateChunkMatrix()
	}

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

	private generateChunkMatrix() {
		this.chunkMatrix = new Matrix<SingleCanvas>(
			this.resolution.map(c => Math.floor((c - 1) / this.chunkSize) + 1),
			null,
			() => new SingleCanvas(createCanvas(Shape.square(this.chunkSize)), this.attributes)
		)
	}

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
