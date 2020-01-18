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
import {Matrix} from "../../common/model/Matrix";
import {Maybe} from "../../common/model/Maybe";
import {SingleCanvas} from "../../common/model/canvas/SingleCanvas";
import {ChunkedCanvas} from "../../common/model/canvas/ChunkedCanvas";

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	private map: ChunkedCanvas;
	private minimap: SingleCanvas;
	private view: SingleCanvas;
	private drawTileFunctions: ((tile: Tile, tileRect: Rectangle, adjacentTiles: Matrix<Maybe<Tile>>) => void)[] = [
		(t, p, a) => this.drawSurface(t, p, a),
		(t, p, a) => this.drawBuilding(t, p, a),
		(t, p, a) => this.drawRoad(t, p, a),
		(t, p, a) => this.drawPlant(t, p, a),
		(t, p, a) => this.drawBorder(t, p, a),
	];

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService
	) {
		this.initMap();
		this.drawView();
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		console.debug('initialize render view');
		this.view = new SingleCanvas(canvas);

		this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));

		window.addEventListener('resize', () => {
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight));
		});
	}

	/**
	 * Responsible for manipulating with map canvas.
	 * Including:
	 *  - loading and offloading sprites
	 *  - rendering and offloading chunks
	 */
	private initMap(): void {
		console.debug('initialize render map');
		this.worldService.world.observable
			.pipe(first())
			.subscribe((world: World) => {
				this.map = new ChunkedCanvas(
					new Shape(
						config.tileResolution * world.tilemap.shape.width,
						config.tileResolution * world.tilemap.shape.height
					),
					Shape.square(config.chunkSize * config.tileResolution)
				);
				this.minimap = SingleCanvas.create(new Shape(
					world.tilemap.shape.width * config.tileResolution,
					world.tilemap.shape.height * config.tileResolution)
				);

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
		this.view.canvas.width = shape.width;
		this.view.canvas.height = shape.height;

		this.cameraService.camera.update();
	}

	private drawView(): void {
		this.cameraService.camera.observable.subscribe(camera => {
			if (!this.view) return;

			this.view.fill('white');

			const viewShape = (tileResolution) => new Shape(
				(this.view.canvas.width * tileResolution) / camera.zoom,
				(this.view.canvas.height * tileResolution) / camera.zoom
			);

			const sourceRect = (tileResolution) => Rectangle.rectangleByOnePoint(
				new Position(
					(camera.position.x * tileResolution) - (viewShape(tileResolution).width / 2),
					(camera.position.y * tileResolution) - (viewShape(tileResolution).height / 2)
				),
				new Shape(viewShape(tileResolution).width, viewShape(tileResolution).height)
			);
			const destinationRect = Rectangle.rectangleByOnePoint(
				new Position(0, 0),
				new Shape(this.view.canvas.width, this.view.canvas.height)
			);
			this.view.context.imageSmoothingEnabled = false;
			if (camera.zoom > 10) {
				this.view.drawImage(
					this.map.of(sourceRect(config.tileResolution)),
					destinationRect,
				)
			} else {
				this.view.drawImage(
					this.minimap.canvas,
					destinationRect,
					sourceRect(config.minimapResolution)
				)
			}
		});
	}

	private drawMap(world: World): void {
		const drawTileFunctions = [
			(t, p, a) => this.drawSurface(t, p, a),
			(t, p, a) => this.drawBuilding(t, p, a),
			(t, p, a) => this.drawRoad(t, p, a),
			(t, p, a) => this.drawPlant(t, p, a),
			(t, p, a) => this.drawBorder(t, p, a),
		];
		drawTileFunctions.forEach((drawTileFunction) =>
			world.tilemap.forEach((tile, position) =>
				this.drawTileLayer(
					tile,
					position,
					this.worldService.getAdjacentTileMatrix(world.tilemap, position),
					drawTileFunction
				)
			)
		);
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

	private drawSprite(sprite: HTMLImageElement, position: Position, scale: number = 1.0): void {
		const spriteRect = Rectangle.rectangleByOnePoint(
			new Position(position.x, position.y),
			new Shape(
				sprite.width * scale,
				sprite.height * scale
			)
		);
		this.map.drawImage(
			sprite,
			spriteRect
		);
		const minimapRect = Rectangle.rectangleByOnePoint(
			new Position(
				(spriteRect.topLeft.x / config.tileResolution) * config.minimapResolution,
				(spriteRect.topLeft.y / config.tileResolution) * config.minimapResolution
			),
			new Shape(
				(spriteRect.shape.width / config.tileResolution) * config.minimapResolution,
				(spriteRect.shape.height / config.tileResolution) * config.minimapResolution
			)
		);
		this.minimap.drawImage(
			sprite,
			minimapRect
		)
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

	private static createCanvas(resolution?: Shape): HTMLCanvasElement {
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		if (resolution) {
			canvas.width = resolution.width;
			canvas.height = resolution.height;
		}
		return canvas;
	}

}
