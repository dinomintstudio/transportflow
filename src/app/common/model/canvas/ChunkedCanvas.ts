import {Shape} from "../Shape";
import {Rectangle} from "../Rectangle";
import {Matrix} from "../Matrix";
import {Position} from "../Position";
import {Canvas, createCanvas} from "./Canvas";
import {SingleCanvas} from "./SingleCanvas";

export class ChunkedCanvas implements Canvas {

	public resolution: Shape;
	public chunkSize: number;
	public chunkMatrix: Matrix<SingleCanvas>;

	constructor(resolution: Shape, chunkSize: number) {
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
			Math.floor(destinationRect.topLeft.x / this.chunkSize),
			Math.floor(destinationRect.topLeft.y / this.chunkSize)
		);

		const chunk: SingleCanvas = this.chunkMatrix.at(chunkPosition);
		const origin: Position = new Position(
			chunkPosition.x * this.chunkSize,
			chunkPosition.y * this.chunkSize
		);

		const mappedDestinationPosition: Position = destinationRect.topLeft.sub(origin);

		// TODO: check if drawing is required
		chunk.drawImage(
			image,
			Rectangle.rectangleByOnePoint(mappedDestinationPosition, destinationRect.shape),
			sourceRect
		)
	}

	private generateChunkMatrix() {
		this.chunkMatrix = new Matrix<SingleCanvas>(
			new Shape(
				Math.floor((this.resolution.width - 1) / this.chunkSize) + 1,
				Math.floor((this.resolution.height - 1) / this.chunkSize) + 1,
			),
			null,
			() => new SingleCanvas(createCanvas(new Shape(this.chunkSize, this.chunkSize)))
		);
	}

	of(rectangle: Rectangle): HTMLCanvasElement {
		const result: HTMLCanvasElement = createCanvas();
		result.width = rectangle.shape.width;
		result.height = rectangle.shape.height;
		const resultContext: CanvasRenderingContext2D = result.getContext('2d');

		const visibleChunksRect = Rectangle.rectangleByTwoPoints(
			rectangle.topLeft.map(c => Math.floor(c / this.chunkSize)),
			rectangle.bottomRight.map(c => Math.floor(c / this.chunkSize) + 1),
		);

		this.chunkMatrix.of(visibleChunksRect).forEach((canvas, position) => {
			if (!canvas) return;

			const mappedDestinationPosition: Position = rectangle.topLeft.sub(position
				.add(visibleChunksRect.topLeft).map(c => c * this.chunkSize)
			);

			resultContext.imageSmoothingEnabled = false;
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
			);
		});

		return result;
	}

	drawPartOn(rectangle: Rectangle, destCanvas: SingleCanvas, destinationRect: Rectangle): void {
		const visibleChunksRect = Rectangle.rectangleByTwoPoints(
			rectangle.topLeft.map(c => Math.floor(c / this.chunkSize)),
			rectangle.bottomRight.map(c => Math.floor(c / this.chunkSize) + 1),
		);

		this.chunkMatrix.of(visibleChunksRect).forEach((canvas, position) => {
			if (!canvas) return;

			const mappedDestinationPosition: Position = rectangle.topLeft.sub(position
				.add(visibleChunksRect.topLeft).map(c => c * this.chunkSize)
			);

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
			);
		});
	}

}
