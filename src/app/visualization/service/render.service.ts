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
import {Log} from "../../common/model/Log";
import _ from 'lodash'
import {InteractionService} from "./interaction.service";
import {SpriteRenderer} from "../model/SpriteRenderer";

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	log: Log = new Log(this);

	map: ChunkedCanvas;
	minimap: SingleCanvas;

	worldCanvas: SingleCanvas;
	viewCanvas: SingleCanvas;
	interactionCanvas: SingleCanvas;

	private spriteRenderers: SpriteRenderer[] = [
		new SpriteRenderer((t) => this.getSurfaceSprite(t)),
		new SpriteRenderer((t) => this.getBuildingSprite(t)),
		new SpriteRenderer((t, a) => this.getRoadSprite(t, a), true),
		new SpriteRenderer((t) => this.getPlantSprite(t)),
		new SpriteRenderer((t) => this.getBorderSprite(t)),
	];

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService,
		private interactionService: InteractionService
	) {
		this.initMap();
		this.loadSprites();

		this.drawWorld();
		this.interactionService.tileHover.subscribe(() => this.drawInteraction());
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		this.log.debug('initialize render view');
		this.viewCanvas = new SingleCanvas(canvas, {alpha: false});

		this.worldCanvas = new SingleCanvas(createCanvas(this.viewCanvas.resolution), {alpha: false});
		this.interactionCanvas = new SingleCanvas(createCanvas(this.viewCanvas.resolution));

		window.addEventListener('resize', () =>
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight))
		);
		window.dispatchEvent(new Event('resize'))
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

				this.minimap = new SingleCanvas(createCanvas(
					new Shape(
						world.tilemap.shape.width * config.minimapResolution,
						world.tilemap.shape.height * config.minimapResolution),
					),
					{alpha: false}
				);

				this.cameraService.camera.set(new Camera(
					new Position(
						world.tilemap.shape.width / 2,
						world.tilemap.shape.height / 2
					),
					config.tileResolution,
					new CameraConfig(
						new Range(10, 1000),
						16
					)
				));

				this.spriteService.loadSprites();
			})
	}

	private loadSprites(): void {
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
		this.viewCanvas.setResolution(shape);
		this.worldCanvas.setResolution(shape);
		this.interactionCanvas.setResolution(shape);

		this.cameraService.camera.update();
	}

	/**
	 * Compose all view canvases into main worldCanvas
	 */
	private composeView() {
		this.viewCanvas.compose(
			this.worldCanvas,
			this.interactionCanvas
		);
	}

	private drawInteraction(): void {
		this.cameraService.camera.observable
			.pipe(first())
			.subscribe(camera => {
				if (camera.zoom > camera.config.minimapTriggerZoom) {
					this.interactionService.tileHover
						.pipe(first())
						.subscribe(hoverPos => {
							this.spriteService.loadSprites(() => {
								this.interactionCanvas.clear();
								this.interactionCanvas.drawImage(
									this.spriteService.fetch('hover'),
									Rectangle.rectangleByOnePoint(
										hoverPos
											.map(c => Math.floor(c))
											.sub(camera.position)
											.map(c => c * camera.zoom)
											.add(Position.fromShape(this.worldCanvas.resolution.map(c => c / 2))),
										Shape.square(camera.zoom)
									)
								);
								this.composeView();
							})
						});
				} else {
					this.interactionCanvas.clear();
				}
			});
	}

	/**
	 * Draw map or minimap on world canvas
	 */
	private drawWorld(): void {
		this.worldService.world.observable
			.pipe(first())
			.subscribe(world => {
				this.cameraService.camera.observable
					.pipe(
						throttleTime(1000 / (config.maxFps || Infinity))
					)
					.subscribe(camera => {
						if (!this.worldCanvas) return;

						const cyclicCamera = new Camera(
							camera.position.mapEach(
								x => x % world.tilemap.shape.width,
								y => y % world.tilemap.shape.height
							),
							camera.zoom,
							camera.config
						)

						const destinationRect = Rectangle.rectangleByOnePoint(
							new Position(0, 0),
							this.worldCanvas.resolution
						);
						this.worldCanvas.context.imageSmoothingEnabled = false;
						this.worldCanvas.clear();
						if (cyclicCamera.zoom > cyclicCamera.config.minimapTriggerZoom) {
							this.drawMapView(cyclicCamera, destinationRect);
							this.interactionCanvas.clear();
						} else {
							this.drawMinimapView(cyclicCamera, destinationRect);
						}
						this.composeView();
					});
			});
	}

	private drawMinimapView(camera: Camera, destinationRect: Rectangle): void {
		this.provideUnboundedCameras(camera, this.minimap.resolution, config.minimapResolution, unboundedCamera => {
			this.worldCanvas.drawImage(
				this.minimap.canvas,
				destinationRect,
				this.getViewCameraRect(unboundedCamera, config.minimapResolution)
			)
		});
	}

	private drawMapView(camera: Camera, destinationRect: Rectangle): void {
		this.provideUnboundedCameras(camera, this.map.resolution, config.tileResolution, unboundedCamera => {
			this.map.drawPartOn(
				this.getViewCameraRect(unboundedCamera, config.tileResolution),
				this.worldCanvas,
				destinationRect
			);
		});
	}

	private provideUnboundedCameras(camera: Camera, mapResolution: Shape, tileResolution: number, cameraSupplier: (camera: Camera) => void): void {
		const tilesPerView = this.worldCanvas.resolution
			.mapEach(
				w => w / (mapResolution.width * camera.zoom / tileResolution),
				h => h / (mapResolution.height * camera.zoom / tileResolution)
			)
			.map(s => Math.floor(s / 2) + 1);

		_.range(-tilesPerView.width, tilesPerView.width + 2).forEach(x => {
			_.range(-tilesPerView.height, tilesPerView.height + 2).forEach(y => {
				cameraSupplier(
					new Camera(
						camera.position.mapEach(
							c => c + (x * mapResolution.width / tileResolution),
							c => c + (y * mapResolution.height / tileResolution)
						),
						camera.zoom,
						camera.config
					)
				);
			});
		});
	}

	private getViewCameraRect(camera, tileResolution: number): Rectangle {
		const viewShape = this.worldCanvas.resolution.map(s => (s * tileResolution) / camera.zoom);
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
		this.spriteRenderers.forEach(spriteRenderer => {
			chunkTilemap.forEach((tile: Tile, position: Position) => {
				if (!tile) return;
				const tilePosition = position.add(chunkTileRect.topLeft);

				spriteRenderer
					.getSprite(
						tile,
						spriteRenderer.needAdjacentTiles
							? this.worldService.getAdjacentTileMatrix(tilemap, tilePosition)
							: null
					)
					.ifPresent(sprite => {
						this.drawMapSprite(
							sprite,
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

	private getSurfaceSprite(tile: Tile): Maybe<HTMLImageElement> {
		let surface: string = tile.surface.type === 'land' ? tile.biome.type : tile.surface.type;
		if (tile.isSnow) surface = 'snow';
		return new Maybe(this.spriteService.fetch(surface));
	}

	private getBorderSprite(_): Maybe<HTMLImageElement> {
		return new Maybe(this.spriteService.fetch('border'));
	}

	private getBuildingSprite(tile: Tile): Maybe<HTMLImageElement> {
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

	private getPlantSprite(tile: Tile): Maybe<HTMLImageElement> {
		if (tile.isPlant) {
			return new Maybe(this.spriteService.fetch('tree'));
		}
		return Maybe.empty();
	}

}
