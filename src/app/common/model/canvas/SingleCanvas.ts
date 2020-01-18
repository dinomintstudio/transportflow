import {Rectangle} from "../Rectangle";
import {Shape} from "../Shape";
import {Position} from "../Position";
import {Canvas} from "./Canvas";

export class SingleCanvas implements Canvas {

	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}

	drawImage(image: CanvasImageSource, destinationRect: Rectangle, sourceRect?: Rectangle): void {
		if (!sourceRect) {
			sourceRect = Rectangle.rectangleByOnePoint(
				new Position(0, 0),
				new Shape(<number>image.width, <number>image.height)
			);
		}
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
	}

	fill(color: string): void {
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	static create(): SingleCanvas {
		return new SingleCanvas(document.createElement('canvas'));
	}

}

