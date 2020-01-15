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

				console.debug('initial draw of tilemap');
				const start = new Date();
				this.drawMap(world, () => {
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

	private drawMap(world: World, drawn?: () => void): void {
		let counter = 0;

		world.tilemap.forEach((tile, position) => {
			this.drawMapTile(
				tile,
				position,
				world.tilemap
					.of(Rectangle.rectangleByOnePoint(
						new Position(position.x - 1, position.y - 1),
						Shape.square(3)
					))
					.map(t => new Maybe<Tile>(t)),
				() => {
					counter++;
					if (counter === world.tilemap.shape.area()) {
						drawn();
					}
				});
		});
	}

	private drawMapTile(tile: Tile, position: Position, adjacentTiles: Matrix<Maybe<Tile>>, drawn?: () => void): void {
		const tileRect = Rectangle.rectangleByOnePoint(
			new Position(
				position.x * config.tileResolution,
				position.y * config.tileResolution
			),
			Shape.square(
				config.tileResolution
			)
		);

		this.drawSurface(tile, tileRect, adjacentTiles, () =>
			this.drawBuilding(tile, tileRect, adjacentTiles, () =>
				this.drawBorder(tileRect, adjacentTiles, () =>
					this.drawRoad(tile, tileRect, adjacentTiles, () =>
						this.drawPlant(tile, tileRect, adjacentTiles, drawn))
				)
			)
		);
	}

	private drawSurface(tile: Tile, tileRect, _, drawn?: () => void): void {
		let surface: string = tile.surface.type === 'land' ? tile.biome.type : tile.surface.type;
		if (tile.isSnow) surface = 'snow';
		this.spriteService.fetch(
			this.matcherService.match(surface, new Map([
				['taiga', 'assets/sprite/terrain/taiga.png'],
				['desert', 'assets/sprite/terrain/desert.png'],
				['jungle', 'assets/sprite/terrain/jungle.png'],
				['water', 'assets/sprite/terrain/water.png'],
				['mountain', 'assets/sprite/terrain/mountain.png'],
				['snow', 'assets/sprite/terrain/snow.png']
			])).get(),
			(sprite) => {
				this.drawSprite(sprite, tileRect.topLeft);
				drawn();
			}
		);
	}

	private drawBorder(tileRect, _, drawn?: () => void): void {
		this.spriteService.fetch(
			'assets/sprite/terrain/border.png',
			(sprite) => {
				this.drawSprite(sprite, tileRect.topLeft);
				drawn();
			}
		)
	}

	private drawBuilding(tile: Tile, tileRect, _, drawn?: () => void): void {
		if (tile.building.isPresent()) {
			const buildingShape: Shape = tile.building.get().position.shape;
			this.spriteService.fetch(
				`assets/sprite/city/house_${buildingShape.width + 1}x${buildingShape.height + 1}.png`,
				(sprite) => {
					this.drawSprite(sprite, tileRect.topLeft);
					drawn();
				}
			);
		} else {
			drawn();
		}
	}

	private drawRoad(tile: Tile, tileRect, adjacentTiles: Matrix<Maybe<Tile>>, drawn?: () => void): void {
		if (tile.road.isPresent()) {
			const adjacentRoads: Matrix<Boolean> = adjacentTiles.map(t => t.isPresent() && t.get().road.isPresent());
			let asset = `assets/sprite/road/road_${
				(adjacentRoads.at(new Position(1, 0)) ? 'n' : '') +
				(adjacentRoads.at(new Position(2, 1)) ? 'e' : '') +
				(adjacentRoads.at(new Position(1, 2)) ? 's' : '') +
				(adjacentRoads.at(new Position(0, 1)) ? 'w' : '')
			}.png`;
			this.spriteService.fetch(
				asset,
				(sprite) => {
					this.drawSprite(sprite, tileRect.topLeft);
					drawn();
				}
			);
		} else {
			drawn();
		}
	}

	private drawPlant(tile: Tile, tileRect, _, drawn?: () => void): void {
		if (tile.isPlant) {
			this.spriteService.fetch(
				'assets/sprite/terrain/tree.png',
				(sprite) => {
					this.drawSprite(sprite, tileRect.topLeft);
					drawn();
				}
			);
		} else {
			drawn();
		}
	}

	private drawSprite(sprite: HTMLImageElement, position: Position): void {
		this.mapCtx.drawImage(
			sprite,
			position.x,
			position.y
		);
	}

}
