import {Injectable} from '@angular/core';
import {CameraService} from "./camera.service";
import {Camera} from "../model/Camera";
import {Position} from "../../common/model/Position";
import {WorldService} from "../../game-logic/service/world.service";
import {SpriteService} from "./sprite.service";
import {first, throttleTime} from "rxjs/operators";
import {World} from "../../game-logic/model/World";

import * as config from '../config/render.config.json'
import {Tile} from "../../game-logic/model/Tile";
import {Rectangle} from "../../common/model/Rectangle";
import {Shape} from "../../common/model/Shape";
import {Matrix} from "../../common/model/Matrix";
import {Maybe} from "../../common/model/Maybe";
import {SingleCanvas} from "../../common/model/canvas/SingleCanvas";
import {ChunkedCanvas} from "../../common/model/canvas/ChunkedCanvas";
import {createCanvas} from "../../common/model/canvas/Canvas";
import {CameraConfig} from "../config/CameraConfig";
import {Range} from "../../common/model/Range";
import {Log} from "../../common/service/log.service";

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	log: Log = new Log(this);

	private map: ChunkedCanvas;
	private minimap: SingleCanvas;
	private view: SingleCanvas;
	private getSpriteFunctions: ((tile: Tile, adjacentTiles: Matrix<Maybe<Tile>>) => Maybe<HTMLImageElement>)[] = [
		(t, a) => this.getSurfaceSprite(t, a),
		(t, a) => this.getBuildingSprite(t, a),
		(t, a) => this.getRoadSprite(t, a),
		(t, a) => this.getPlantSprite(t, a),
		(t, a) => this.getBorderSprite(t, a),
	];

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService
	) {
		this.initMap();
		this.drawView();
		this.loadSprites();
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		this.log.debug('initialize render view');
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
		this.log.debug('initialize render map');
		this.worldService.world.observable
			.pipe(first())
			.subscribe((world: World) => {
				this.map = new ChunkedCanvas(
					new Shape(
						config.tileResolution * world.tilemap.shape.width,
						config.tileResolution * world.tilemap.shape.height
					),
					config.chunkSize * config.tileResolution
				);
				this.minimap = new SingleCanvas(createCanvas(new Shape(
					world.tilemap.shape.width * config.minimapResolution,
					world.tilemap.shape.height * config.minimapResolution)
				));

				this.cameraService.camera.set(new Camera(
					new Position(
						world.tilemap.shape.width / 2,
						world.tilemap.shape.height / 2
					),
					config.tileResolution,
					new CameraConfig(
						new Range(1, 1000),
						16
					)
				));

				this.spriteService.loadSprites(() => {
				});
			})
	}

	private loadSprites() {
		this.spriteService.loadSprites(() => {
			this.log.debug('load sprites');
			this.worldService.world.observable.subscribe(world => {
				this.cameraService.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.log.debug('draw visible chunks');
						const startDrawChunks = new Date();
						this.drawChunks(world.tilemap, camera);
						this.log.debug(`drawn visible chunks in ${(new Date().getTime() - startDrawChunks.getTime())}ms`);

						this.log.debug('draw minimap');
						const startDrawMinimap = new Date();
						this.drawMinimap(world.tilemap);
						this.log.debug(`drawn minimap in ${(new Date().getTime() - startDrawMinimap.getTime())}ms`);

						this.cameraService.camera.update();
					});
			});
		});
	}

	private resizeCanvas(shape: Shape): void {
		this.view.canvas.width = shape.width;
		this.view.canvas.height = shape.height;

		this.cameraService.camera.update();
	}

	private drawView(): void {
		const frameDelay = 1000 / (config.maxFps || Infinity);
		this.cameraService.camera.observable
			.pipe(
				throttleTime(frameDelay)
			)
			.subscribe(camera => {
				if (!this.view) return;

				this.view.fill('white');

				const sourceRect = this.getMapRectByCamera(camera);
				const destinationRect = Rectangle.rectangleByOnePoint(
					new Position(0, 0),
					new Shape(this.view.canvas.width, this.view.canvas.height)
				);
				this.view.context.imageSmoothingEnabled = false;
				if (camera.zoom > camera.config.minimapTriggerZoom) {
					this.map.drawPartOn(sourceRect(config.tileResolution), this.view, destinationRect);
				} else {
					this.view.drawImage(
						this.minimap.canvas,
						destinationRect,
						sourceRect(config.minimapResolution)
					)
				}
			});
	}

	private getMapRectByCamera(camera) {
		const viewShape = (tileResolution) => new Shape(
			(this.view.canvas.width * tileResolution) / camera.zoom,
			(this.view.canvas.height * tileResolution) / camera.zoom
		);
		return (tileResolution) => Rectangle.rectangleByOnePoint(
			new Position(
				(camera.position.x * tileResolution) - (viewShape(tileResolution).width / 2),
				(camera.position.y * tileResolution) - (viewShape(tileResolution).height / 2)
			),
			new Shape(viewShape(tileResolution).width, viewShape(tileResolution).height)
		);
	}

	private drawChunks(tilemap: Matrix<Tile>, camera: Camera): void {
		this.map.chunkMatrix.forEach((chunk, position) => {
			if (chunk.isDrawn) return;
			this.drawChunk(position, tilemap);
		});
	}

	private drawChunk(chunkPosition: Position, tilemap: Matrix<Tile>): void {
		const chunkTileRect: Rectangle = Rectangle.rectangleByOnePoint(
			new Position(
				chunkPosition.x * config.chunkSize,
				chunkPosition.y * config.chunkSize
			),
			Shape.square(config.chunkSize)
		);
		const chunkTilemap: Matrix<Tile> = tilemap.of(chunkTileRect);
		this.getSpriteFunctions.forEach(getSpriteFunction => {
			chunkTilemap.forEach((tile: Tile, position: Position) => {
				if (!tile) return;
				const tilePosition = position.add(chunkTileRect.topLeft);
				const sprite: Maybe<HTMLImageElement> = getSpriteFunction(tile, this.worldService.getAdjacentTileMatrix(tilemap, tilePosition));
				sprite.ifPresent(s => {
					this.drawMapSprite(
						s,
						tilePosition.map(c => c * config.tileResolution)
					);
				});
			})
		});
	}

	private drawMinimap(tilemap: Matrix<Tile>): void {
		this.map.chunkMatrix.forEach((chunk, position) => {
			this.minimap.drawImage(
				chunk.canvas,
				Rectangle.rectangleByOnePoint(
					position.map(c => c * config.chunkSize),
					Shape.square(config.chunkSize)
				).multiply(config.minimapResolution)
			)
		});
	}

	private drawMapSprite(sprite: HTMLImageElement, position: Position): void {
		const spriteRect = Rectangle.rectangleByOnePoint(
			new Position(position.x, position.y),
			new Shape(sprite.width, sprite.height)
				.map(s => (s / config.spriteResolution) * config.tileResolution)
		);
		this.map.drawImage(
			sprite,
			spriteRect
		);
	}

	private getSurfaceSprite(tile: Tile, _): Maybe<HTMLImageElement> {
		let surface: string = tile.surface.type === 'land' ? tile.biome.type : tile.surface.type;
		if (tile.isSnow) surface = 'snow';
		return new Maybe(this.spriteService.fetch(surface));
	}

	private getBorderSprite(_, __): Maybe<HTMLImageElement> {
		return new Maybe(this.spriteService.fetch('border'));
	}

	private getBuildingSprite(tile: Tile, _): Maybe<HTMLImageElement> {
		if (tile.building.isPresent() && tile.building.get().position.topLeft.equals(tile.position)) {
			const buildingShape: Shape = tile.building.get().position.shape;
			return new Maybe(
				this.spriteService.fetch(`house_${buildingShape.width + 1}x${buildingShape.height + 1}`)
			);
		}
		return Maybe.empty();
	}

	private getRoadSprite(tile: Tile, adjacentTiles: Matrix<Maybe<Tile>>): Maybe<HTMLImageElement> {
		if (tile.road.isPresent()) {
			const adjacentRoads: Matrix<Boolean> = adjacentTiles.map(t => t.isPresent() && t.get().road.isPresent());
			let asset = `road_${
				(adjacentRoads.at(new Position(1, 0)) ? 'n' : '') +
				(adjacentRoads.at(new Position(2, 1)) ? 'e' : '') +
				(adjacentRoads.at(new Position(1, 2)) ? 's' : '') +
				(adjacentRoads.at(new Position(0, 1)) ? 'w' : '')
			}`;
			return new Maybe(this.spriteService.fetch(asset));
		}
		return Maybe.empty();
	}

	private getPlantSprite(tile: Tile, _): Maybe<HTMLImageElement> {
		if (tile.isPlant) {
			return new Maybe(this.spriteService.fetch('tree'));
		}
		return Maybe.empty();
	}

}
