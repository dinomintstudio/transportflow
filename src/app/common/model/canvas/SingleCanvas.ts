import {Rectangle} from "../Rectangle";
import {Shape} from "../Shape";
import {Position} from "../Position";
import {Canvas} from "./Canvas";

export class SingleCanvas implements Canvas {

	public canvas: HTMLCanvasElement;
	public resolution: Shape;
	public context: CanvasRenderingContext2D;
	public isDrawn: Boolean;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.resolution = new Shape(canvas.width, canvas.height);
		this.context = canvas.getContext('2d');
		this.isDrawn = false;
	}

	setResolution(resolution: Shape) {
		this.resolution = resolution;
		this.canvas.width = resolution.width;
		this.canvas.height = resolution.height;
	}

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void {
		if (!sourceRect) {
			sourceRect = Rectangle.rectangleByOnePoint(
				new Position(0, 0),
				new Shape(<number>image.width, <number>image.height)
			);
		}
		this.context.imageSmoothingEnabled = false;
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
		);
		this.isDrawn = true;
	}

	fill(color: string): void {
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

}

