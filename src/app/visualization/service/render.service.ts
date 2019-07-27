import {Injectable} from '@angular/core';
import {CameraService} from "./camera.service";
import {Camera} from "../model/Camera";
import {Position} from "../../common/model/Position";
import {Shape} from "../../common/model/Shape";
import {Tile} from "../../game-logic/model/Tile";
import {WorldService} from "../../game-logic/service/world.service";
import {Rectangle} from "../../common/model/Rectangle";
import {SpriteService} from "./sprite.service";
import {matches} from 'z'
import {first} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService
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
		this.draw();
	}

	draw(): void {
		this.cameraService.camera.observable.subscribe(camera => {
			this.worldService.world.observable
				.pipe(first())
				.subscribe(world => {
					this.ctx.fillStyle = 'white';
					this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

					const cameraPos = new Position(this.canvas.width / 2, this.canvas.height / 2);

					world.tilemap.forEach((tile, position) => {
						this.drawTile(tile, position, camera, cameraPos);
					});
				});
		});
	}

	drawTile(tile: Tile, position: Position, camera: Camera, cameraPos: Position): void {
		const tileRect = Rectangle.rectangleByOnePoint(
			new Position((
				(position.x - camera.position.x) * 64 * camera.zoom) + cameraPos.x,
				((position.y - camera.position.y) * 64 * camera.zoom) + cameraPos.y
			),
			new Shape(
				64 * camera.zoom,
				64 * camera.zoom
			)
		);

		if (!this.isVisible(tileRect)) return;

		this.spriteService.fetch(
			matches(tile.surface.type)(
				(x = 'water') => 'assets/sprite/terrain/water.svg',
				(x = 'land') => 'assets/sprite/terrain/taiga.svg',
				(x = 'mountain') => 'assets/sprite/terrain/mountain.svg'
			),
			(sprite) => {
				this.ctx.drawImage(
					sprite,
					tileRect.topLeft.x,
					tileRect.topLeft.y,
					tileRect.shape.width,
					tileRect.shape.height
				)
			}
		)

	}

	private isVisible(tileRect: Rectangle) {
		return tileRect.bottomRight.x >= 0 &&
			tileRect.bottomRight.y >= 0 &&
			tileRect.topLeft.x < this.canvas.width &&
			tileRect.topLeft.y < this.canvas.height;
	}

}
