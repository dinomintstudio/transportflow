import {Injectable} from '@angular/core';
import {CameraService} from "./camera.service";
import {Camera} from "../model/Camera";
import {Position} from "../../common/model/Position";
import {WorldService} from "../../game-logic/service/world.service";
import {SpriteService} from "./sprite.service";
import {first} from "rxjs/operators";
import {World} from "../../game-logic/model/World";

import * as config from '../config/render.config.json'
import {Tile} from "../../game-logic/model/Tile";
import {Rectangle} from "../../common/model/Rectangle";
import {Shape} from "../../common/model/Shape";

import {matches} from 'z'

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	private mapCanvas: HTMLCanvasElement;
	private mapCtx: CanvasRenderingContext2D;

	private viewCanvas: HTMLCanvasElement;
	private viewCtx: CanvasRenderingContext2D;

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService
	) {
		this.initMap();
		this.drawView();
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		this.viewCanvas = canvas;
		this.viewCtx = this.viewCanvas.getContext('2d');

		this.resizeCanvas(this.viewCanvas, new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));

		window.addEventListener('resize', () => {
			this.resizeCanvas(this.viewCanvas, new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));
		});
	}

	initMap(): void {
		this.mapCanvas = document.createElement('canvas');
		this.mapCtx = this.mapCanvas.getContext('2d');

		this.worldService.world.observable
			.pipe(first())
			.subscribe(world => {
				this.mapCanvas.width = config.tileResolution * world.tilemap.shape.width;
				this.mapCanvas.height = config.tileResolution * world.tilemap.shape.height;

				this.cameraService.camera.set(new Camera(
					new Position(
						world.tilemap.shape.width / 2,
						world.tilemap.shape.height / 2
					),
					config.tileResolution
				));

				console.debug('initial draw of tilemap');
				this.drawMap(world, () => {
					console.debug('initial draw of tilemap complete');
					return this.cameraService.camera.update();
				});
			})
	}

	private resizeCanvas(canvas: HTMLCanvasElement, shape: Shape): void {
		this.viewCanvas.width = shape.width;
		this.viewCanvas.height = shape.height;

		this.cameraService.camera.update();
	}

	private drawMap(world: World, drawn?: () => void): void {
		let counter = 0;

		world.tilemap.forEach((tile, position) => {
			this.drawMapTile(tile, position, () => {
				counter++;
				if (counter === world.tilemap.shape.area()) {
					drawn();
				}
			});
		});
	}

	private drawMapTile(tile: Tile, position: Position, drawn?: () => void) {
		const tileRect = Rectangle.rectangleByOnePoint(
			new Position(
				position.x * config.tileResolution,
				position.y * config.tileResolution
			),
			Shape.square(
				config.tileResolution
			)
		);

		this.spriteService.fetch(
			matches(tile.surface.type)(
				(_ = 'water') => 'assets/sprite/terrain/water.svg',
				(_ = 'land') => 'assets/sprite/terrain/taiga.svg',
				(_ = 'mountain') => 'assets/sprite/terrain/mountain.svg'
			),
			(sprite) => {
				this.mapCtx.drawImage(
					sprite,
					tileRect.topLeft.x,
					tileRect.topLeft.y,
					tileRect.shape.width,
					tileRect.shape.height
				);
				drawn();
			}
		);
	}

	private drawView() {
		this.cameraService.camera.observable.subscribe(camera => {
			if (!this.viewCtx) return;

			this.viewCtx.fillStyle = 'white';
			this.viewCtx.fillRect(0, 0, this.viewCanvas.width, this.viewCanvas.height);

			const viewShape = new Shape(
				(this.viewCanvas.width * config.tileResolution) / camera.zoom,
				(this.viewCanvas.height * config.tileResolution) / camera.zoom
			);

			this.viewCtx.drawImage(
				this.mapCanvas,
				(camera.position.x * config.tileResolution) - (viewShape.width / 2),
				(camera.position.y * config.tileResolution) - (viewShape.height / 2),
				viewShape.width,
				viewShape.height,
				0,
				0,
				this.viewCanvas.width,
				this.viewCanvas.height
			)
		});
	}
}
