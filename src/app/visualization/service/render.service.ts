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
import _ from 'lodash'

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
						this.drawMinimap();
						this.log.debug(`drawn minimap in ${(new Date().getTime() - startDrawMinimap.getTime())}ms`);

						this.cameraService.camera.update();
					});
			});
		});
	}

	private resizeCanvas(shape: Shape): void {
		this.view.setResolution(shape);

		this.cameraService.camera.update();
	}

	private drawView(): void {
		const frameDelay = 1000 / (config.maxFps || Infinity);
		this.worldService.world.observable
			.pipe(
				first()
			)
			.subscribe(world => {
				this.cameraService.camera.observable
					.pipe(
						throttleTime(frameDelay)
					)
					.subscribe(camera => {
						const cyclicCamera = new Camera(
							camera.position.mapEach(
								x => x % world.tilemap.shape.width,
								y => y % world.tilemap.shape.height
							),
							camera.zoom,
							camera.config
						)
						if (!this.view) return;

						this.view.fill('white');

						const destinationRect = Rectangle.rectangleByOnePoint(
							new Position(0, 0),
							this.view.resolution
						);
						this.view.context.imageSmoothingEnabled = false;
						if (cyclicCamera.zoom > cyclicCamera.config.minimapTriggerZoom) {
							this.drawMapView(cyclicCamera, destinationRect);
						} else {
							this.drawMinimapView(cyclicCamera, destinationRect);
						}
					});
			});
	}

	// TODO: refactor
	private drawMinimapView(camera: Camera, destinationRect: Rectangle) {
		const tilesPerView = this.view.resolution
			.mapEach(
				w => w / (this.minimap.resolution.width * camera.zoom / config.minimapResolution),
				h => h / (this.minimap.resolution.height * camera.zoom / config.minimapResolution)
			)
			.map(s => Math.floor(s / 2) + 1);
		_.range(-tilesPerView.height, tilesPerView.height + 2).forEach(i => {
			_.range(-tilesPerView.width, tilesPerView.width + 2).forEach(j => {
				const tileCamera = new Camera(
					camera.position.mapEach(
						c => c + (j * this.minimap.resolution.width / config.minimapResolution),
						c => c + (i * this.minimap.resolution.height / config.minimapResolution)
					),
					camera.zoom,
					camera.config
				);
				this.view.drawImage(
					this.minimap.canvas,
					destinationRect,
					this.getMapRectByCamera(tileCamera, config.minimapResolution)
				);
			});
		});
	}

	// TODO: refactor
	private drawMapView(camera: Camera, destinationRect: Rectangle) {
		const tilesPerView = this.view.resolution
			.mapEach(
				w => w / (this.map.resolution.width * camera.zoom / config.tileResolution),
				h => h / (this.map.resolution.height * camera.zoom / config.tileResolution)
			)
			.map(s => Math.floor(s / 2) + 1);
		_.range(-tilesPerView.height, tilesPerView.height + 2).forEach(i => {
			_.range(-tilesPerView.width, tilesPerView.width + 2).forEach(j => {
				const tileCamera = new Camera(
					camera.position.mapEach(
						c => c + (j * this.map.resolution.width / config.tileResolution),
						c => c + (i * this.map.resolution.height / config.tileResolution)
					),
					camera.zoom,
					camera.config
				);
				this.map.drawPartOn(
					this.getMapRectByCamera(tileCamera, config.tileResolution),
					this.view,
					destinationRect
				);
			});
		});
	}

	private getMapRectByCamera(camera, tileResolution: number): Rectangle {
		const viewShape = this.view.resolution.map(s => (s * tileResolution) / camera.zoom);
		return Rectangle.rectangleByOnePoint(
			new Position(
				(camera.position.x * tileResolution) - (viewShape.width / 2),
				(camera.position.y * tileResolution) - (viewShape.height / 2)
			),
			viewShape
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

	private drawMinimap(): void {
		this.map.chunkMatrix.forEach((chunk, position) => {
			this.minimap.drawImage(
				chunk.canvas,
				Rectangle.rectangleByOnePoint(
					position.map(c => c * config.chunkSize),
					Shape.square(config.chunkSize)
				).multiply(config.minimapResolution)
			)
		});
		this.minimap.drawBorder(1, "rgba(0, 0, 0, 0.3)")
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
