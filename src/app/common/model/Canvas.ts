export class Canvas {

	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}

	static create(): Canvas {
		return new Canvas(document.createElement('canvas'));
	}

}
