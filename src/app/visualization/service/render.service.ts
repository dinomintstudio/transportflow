import {Injectable} from '@angular/core';
import {CameraService} from "./camera.service";
import {Camera} from "../model/Camera";
import {Position} from "../../common/model/Position";
import {Shape} from "../../common/model/Shape";
import {Matrix} from "../../common/model/Matrix";

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor(
		private cameraService: CameraService
	) {
		cameraService.camera.set(new Camera(
			new Position(5, 5),
			1
		));
	}

	initializeCanvas(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		this.canvas = canvas;

		this.resizeCanvas(canvas, new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));

		window.addEventListener('resize', () => {
			this.resizeCanvas(canvas, new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));
		});
	}

	resetCanvas(): void {
		this.canvas.width = 0;
		this.canvas.height = 0;

		this.canvas = null;
		this.ctx = null;

		window.addEventListener('resize', (e) => {
			e.stopPropagation();
		});
	}

	resizeCanvas(canvas: HTMLCanvasElement, shape: Shape): void {
		this.canvas.width = shape.width;
		this.canvas.height = shape.height;

		this.ctx = this.canvas.getContext('2d');
		this.draw();
	}

	draw(): void {
		this.cameraService.camera.observable.subscribe(camera => {
			this.ctx.fillStyle = 'purple';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			const map = new Matrix<any>(new Shape(10, 10), null, true);
			const cameraPos = new Position(this.canvas.width / 2, this.canvas.height / 2);

			map.forEach((tile, position) => {
				if (!tile) return;

				this.ctx.fillStyle = 'red';
				this.ctx.strokeStyle = 'pink';
				this.ctx.beginPath();
				this.ctx.arc(cameraPos.x, cameraPos.y, 10, 0, Math.PI * 2);
				this.ctx.stroke();
				this.ctx.closePath();
				this.ctx.beginPath();
				this.ctx.rect(
					((position.x - camera.position.x) * 64 * camera.zoom) + cameraPos.x,
					((position.y - camera.position.y) * 64 * camera.zoom) + cameraPos.y,
					64 * camera.zoom,
					64 * camera.zoom
				);
				this.ctx.stroke();
				this.ctx.closePath();
			});
		});
	}

}
