import {Shape} from "../Shape";
import {Rectangle} from "../Rectangle";
import {Matrix} from "../Matrix";
import {Position} from "../Position";
import {Canvas, createCanvas} from "./Canvas";

export class ChunkedCanvas implements Canvas {

	public resolution: Shape;
	public chunkSize: Shape;
	public chunkMatrix: Matrix<HTMLCanvasElement>;

	constructor(resolution: Shape, chunkSize: Shape) {
		this.resolution = resolution;
		this.chunkSize = chunkSize;
		this.generateChunkMatrix();
	}

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void {
		if (!sourceRect) {
			sourceRect = Rectangle.rectangleByOnePoint(
				new Position(0, 0),
				new Shape(<number>image.width, <number>image.height)
			);
		}

		const chunkPosition: Position = new Position(
			Math.floor(destinationRect.topLeft.x / this.chunkSize.width),
			Math.floor(destinationRect.topLeft.y / this.chunkSize.height)
		);

		const chunk: HTMLCanvasElement = this.chunkMatrix.at(chunkPosition);
		const origin: Position = new Position(
			chunkPosition.x * this.chunkSize.width,
			chunkPosition.y * this.chunkSize.height
		);

		const mappedDestinationPosition: Position = destinationRect.topLeft.sub(origin);

		// TODO: check if drawing is required
		const context = chunk.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.drawImage(
			image,
			sourceRect.topLeft.x,
			sourceRect.topLeft.y,
			sourceRect.shape.width,
			sourceRect.shape.height,
			mappedDestinationPosition.x,
			mappedDestinationPosition.y,
			destinationRect.shape.width,
			destinationRect.shape.height,
		);
	}

	private generateChunkMatrix() {
		this.chunkMatrix = new Matrix<HTMLCanvasElement>(
			new Shape(
				Math.floor((this.resolution.width - 1) / this.chunkSize.width) + 1,
				Math.floor((this.resolution.height - 1) / this.chunkSize.height) + 1,
			),
			null,
			() => createCanvas()
		);

		this.chunkMatrix.forEach(c => {
			c.width = this.chunkSize.width;
			c.height = this.chunkSize.height;
		});
	}

	of(rectangle: Rectangle): HTMLCanvasElement {
		const result: HTMLCanvasElement = createCanvas();
		result.width = rectangle.shape.width;
		result.height = rectangle.shape.height;
		const resultContext: CanvasRenderingContext2D = result.getContext('2d');

		this.chunkMatrix.forEach((canvas, position) => {
			const chunkRect: Rectangle = Rectangle.rectangleByOnePoint(
				new Position(
					position.x * this.chunkSize.width,
					position.y * this.chunkSize.height
				),
				new Shape(this.chunkSize.width, this.chunkSize.height)
			);

			if ((chunkRect.bottomRight.x <= rectangle.topLeft.x && chunkRect.bottomRight.y <= rectangle.topLeft.y) ||
				(chunkRect.topLeft.x > rectangle.bottomRight.x && chunkRect.topLeft.y > rectangle.bottomRight.y)) return;

			const mappedDestinationPosition: Position = rectangle.topLeft.sub(chunkRect.topLeft);

			resultContext.imageSmoothingEnabled = false;
			resultContext.drawImage(
				canvas,
				mappedDestinationPosition.x,
				mappedDestinationPosition.y,
				result.width,
				result.height,
				0,
				0,
				rectangle.shape.width,
				rectangle.shape.height,
			);
		});

		return result;
	}

}
