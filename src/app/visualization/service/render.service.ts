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
import {MatcherService} from "../../util/service/matcher.service";
import {Matrix} from "../../common/model/Matrix";
import {Maybe} from "../../common/model/Maybe";

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
		private spriteService: SpriteService,
		private matcherService: MatcherService,
	) {
		this.initMap();
		this.drawView();
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		console.debug('initialize render view');
		this.viewCanvas = canvas;
		this.viewCtx = this.viewCanvas.getContext('2d');

		this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));

		window.addEventListener('resize', () => {
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));
		});
	}

	initMap(): void {
		this.worldService.world.observable
			.pipe(first())
			.subscribe(world => {
				console.debug('initialize render map');
				this.mapCanvas = document.createElement('canvas');
				this.mapCtx = this.mapCanvas.getContext('2d');

				this.mapCanvas.width = config.tileResolution * world.tilemap.shape.width;
				this.mapCanvas.height = config.tileResolution * world.tilemap.shape.height;

				this.cameraService.camera.set(new Camera(
					new Position(
						world.tilemap.shape.width / 2,
						world.tilemap.shape.height / 2
					),
					config.tileResolution
				));

				console.debug('load sprites');
				this.spriteService.loadSprites(() => {
					console.debug('initial draw of tilemap');
					const start = new Date();
					this.drawMap(world);
					console.debug(`initial draw of tilemap complete in ${(new Date().getTime() - start.getTime())}ms`);
					return this.cameraService.camera.update();
				});
			})
	}

	private resizeCanvas(shape: Shape): void {
		this.viewCanvas.width = shape.width;
		this.viewCanvas.height = shape.height;

		this.cameraService.camera.update();
	}

	private drawView(): void {
		this.cameraService.camera.observable.subscribe(camera => {
			if (!this.viewCtx) return;

			this.viewCtx.fillStyle = 'white';
			this.viewCtx.fillRect(0, 0, this.viewCanvas.width, this.viewCanvas.height);

			const viewShape = new Shape(
				(this.viewCanvas.width * config.tileResolution) / camera.zoom,
				(this.viewCanvas.height * config.tileResolution) / camera.zoom
			);

			this.viewCtx.imageSmoothingEnabled = false;

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

	private drawMap(world: World): void {
		// TODO: refactor
		const drawTileFunctions = [
			(t, p, a) => this.drawSurface(t, p, a),
			(t, p, a) => this.drawBuilding(t, p, a),
			(t, p, a) => this.drawBorder(t, p, a),
			(t, p, a) => this.drawRoad(t, p, a),
			(t, p, a) => this.drawPlant(t, p, a)
		];
		drawTileFunctions.forEach((drawTileFunction) =>
			world.tilemap.forEach((tile, position) => {
				this.drawTileLayer(
					tile,
					position,
					this.worldService.getAdjacentTileMatrix(world.tilemap, position),
					drawTileFunction
				)
			}));
	}

	private drawTileLayer(tile: Tile, position: Position, adjacentTiles: Matrix<Maybe<Tile>>, drawTileFunction: (tile, tileRect, adjacentTiles) => void): void {
		const tileRect: Rectangle = Rectangle.rectangleByOnePoint(
			new Position(
				position.x * config.tileResolution,
				position.y * config.tileResolution
			),
			Shape.square(
				config.tileResolution
			)
		);

		drawTileFunction(tile, tileRect, adjacentTiles);
	}

	private drawSurface(tile: Tile, tileRect: Rectangle, _): void {
		let surface: string = tile.surface.type === 'land' ? tile.biome.type : tile.surface.type;
		if (tile.isSnow) surface = 'snow';
		const sprite = this.spriteService.fetch(surface);
		this.drawSprite(sprite, tileRect.topLeft);
	}

	private drawBorder(tile: Tile, tileRect: Rectangle, _): void {
		const sprite = this.spriteService.fetch('border');
		this.drawSprite(sprite, tileRect.topLeft);
	}

	private drawBuilding(tile: Tile, tileRect: Rectangle, _): void {
		if (tile.building.isPresent() && tile.building.get().position.topLeft.equals(tile.position)) {
			const buildingShape: Shape = tile.building.get().position.shape;
			const sprite = this.spriteService.fetch(`house_${buildingShape.width + 1}x${buildingShape.height + 1}`);
			this.drawSprite(sprite, tileRect.topLeft);
		}
	}

	private drawRoad(tile: Tile, tileRect: Rectangle, adjacentTiles: Matrix<Maybe<Tile>>): void {
		if (tile.road.isPresent()) {
			const adjacentRoads: Matrix<Boolean> = adjacentTiles.map(t => t.isPresent() && t.get().road.isPresent());
			let asset = `road_${
				(adjacentRoads.at(new Position(1, 0)) ? 'n' : '') +
				(adjacentRoads.at(new Position(2, 1)) ? 'e' : '') +
				(adjacentRoads.at(new Position(1, 2)) ? 's' : '') +
				(adjacentRoads.at(new Position(0, 1)) ? 'w' : '')
			}`;
			const sprite = this.spriteService.fetch(asset);
			this.drawSprite(sprite, tileRect.topLeft);
		}
	}

	private drawPlant(tile: Tile, tileRect: Rectangle, _): void {
		if (tile.isPlant) {
			const sprite = this.spriteService.fetch('tree');
			this.drawSprite(sprite, tileRect.topLeft);
		}
	}

	private drawSprite(sprite: HTMLImageElement, position: Position, scale: number = 1.0): void {
		this.mapCtx.drawImage(
			sprite,
			position.x,
			position.y,
			sprite.width * scale,
			sprite.height * scale
		);
	}

}
