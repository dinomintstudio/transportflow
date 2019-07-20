import {Injectable, OnInit} from '@angular/core';
import {CameraService} from "./camera.service";
import {Camera} from "../model/Camera";
import {Position} from "../../common/model/Position";
import {Shape} from "../../common/model/Shape";


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
			new Position(0, 0),
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
		this.ctx.fillStyle = 'purple';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

}
