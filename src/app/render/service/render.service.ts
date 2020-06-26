import {Injectable} from '@angular/core'
import {CameraService} from './camera.service'
import {Camera} from '../model/Camera'
import {Position} from '../../common/model/Position'
import {WorldService} from '../../game-logic/service/world.service'
import {SpriteService} from './sprite.service'
import {first, throttleTime} from 'rxjs/operators'
import {World} from '../../game-logic/model/World'

import {Tile} from '../../game-logic/model/Tile'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'
import {Matrix} from '../../common/model/Matrix'
import {SingleCanvas} from '../../common/model/canvas/SingleCanvas'
import {ChunkedCanvas} from '../../common/model/canvas/ChunkedCanvas'
import {createCanvas} from '../../common/model/canvas/Canvas'
import {CameraConfig} from '../config/CameraConfig'
import {Range} from '../../common/model/Range'
import {Log} from '../../common/model/Log'
import * as _ from 'lodash'
import {InteractionService} from '../../input/service/interaction.service'
import {RenderProfileService} from './render-profile.service'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'
import {SpriteRenderService} from './sprite-render.service'

@Injectable({
	providedIn: 'root'
})
export class RenderService {

	log: Log = new Log(this)

	map: ChunkedCanvas
	minimap: SingleCanvas

	worldLayer: SingleCanvas
	viewCanvas: SingleCanvas
	interactionLayer: SingleCanvas

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService,
		private spriteRenderService: SpriteRenderService,
		private interactionService: InteractionService,
		private renderProfileService: RenderProfileService,
		private configService: ConfigService
	) {
		this.loadSprites()
		this.initMap(() => {
			this.updateChunks(() => setTimeout(() => this.cameraService.camera.update(), 0))
			this.updateView()
			this.interactionService.tileHover.subscribe(() => this.drawInteraction())
			// setTimeout(() => this.cameraService.camera.update(), 0)
		})
	}

	initView(canvas: HTMLCanvasElement, canvasContainer: HTMLElement): void {
		this.log.debug('initialize render view')
		this.viewCanvas = new SingleCanvas(canvas)

		this.worldLayer = new SingleCanvas(createCanvas(this.viewCanvas.resolution), true)
		this.interactionLayer = new SingleCanvas(createCanvas(this.viewCanvas.resolution), true)

		window.addEventListener('resize', () =>
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight))
		)
		window.dispatchEvent(new Event('resize'))
	}

	private loadSprites() {
		this.log.debug('load sprites')
		const startLoadSprites = new Date()
		this.spriteService.loadSprites()
		this.log.debug(`loaded sprites in ${(new Date().getTime() - startLoadSprites.getTime())}ms`)
	}

	/**
	 * Initialization of map, minimap and initial camera set
	 */
	private initMap(complete?: () => void): void {
		this.log.debug('initialize render maps')
		this.worldService.world.observable
			.pipe(first())
			.subscribe((world: World) => {
				this.configService.renderConfig.observable
					.pipe(first())
					.subscribe(config => {
						this.log.debug('initialize map')
						this.map = new ChunkedCanvas(
							world.tilemap.shape.map(s => s * config.tileResolution),
							config.chunkSize * config.tileResolution
						)

						this.log.debug('initialize minimap')
						this.minimap = new SingleCanvas(
							createCanvas(world.tilemap.shape.map(s => s * config.minimapResolution))
						)

						this.log.debug('set initial camera')
						this.cameraService.camera.set(new Camera(
							Position.fromShape(world.tilemap.shape).map(c => c / 2),
							config.tileResolution,
							new CameraConfig(
								new Range(1, 1000),
								16
							)
						))

						complete?.()
					})
			})
	}

	// TODO: refactor
	// TODO: optimize; draw only visible chunks with specified overhead
	// TODO: optimize; redraw only changed chunks
	private updateChunks(complete?: () => void): void {
		this.spriteService.loadSprites(() => {
			this.worldService.world.observable.subscribe(world => {
				this.log.debug('draw visible chunks')
				const startDrawChunks = new Date()
				this.drawChunks(world.tilemap)
				this.log.debug(`drawn visible chunks in ${(new Date().getTime() - startDrawChunks.getTime())}ms`)

				this.log.debug('draw minimap')
				const startDrawMinimap = new Date()
				this.drawMinimap()
				this.log.debug(`drawn minimap in ${(new Date().getTime() - startDrawMinimap.getTime())}ms`)

				complete?.()
			})
		})
	}

	/**
	 * Update map view or minimap view based on zoom for each new world update
	 */
	private updateView(complete?: () => void): void {
		this.configService.renderConfig.observable.subscribe(config => {
			this.worldService.world.observable
				.pipe(first())
				.subscribe(world => {
					this.cameraService.camera.observable
						.pipe(
							untilNewFrom(this.configService.renderConfig.observable),
							throttleTime(1000 / (config.maxFps || Infinity))
						)
						.subscribe(camera => {
							if (!this.worldLayer) return
							this.renderProfileService.frame.set()

							const cyclicCamera = new Camera(
								camera.position.mapEach(
									x => x % world.tilemap.shape.width,
									y => y % world.tilemap.shape.height
								),
								camera.zoom,
								camera.config
							)

							const destinationRect = Rectangle.rectangleByOnePoint(
								Position.ZERO,
								this.worldLayer.resolution
							)

							if (cyclicCamera.zoom > cyclicCamera.config.minimapTriggerZoom) {
								this.drawMapView(cyclicCamera, destinationRect)
								this.interactionLayer.clear()
							} else {
								this.drawMinimapView(cyclicCamera, destinationRect)
							}
							this.composeView()
							complete?.()
						})
				})
		})
	}

	private resizeCanvas(shape: Shape): void {
		[this.viewCanvas, this.worldLayer, this.interactionLayer].forEach(c => c.setResolution(shape))
		this.cameraService.camera.update()
	}

	/**
	 * Compose all visible layers into main viewCanvas
	 */
	private composeView() {
		this.viewCanvas.compose(
			this.worldLayer,
			this.interactionLayer
		)
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
								this.interactionLayer.clear()
								this.interactionLayer.drawImage(
									this.spriteService.fetch('hover'),
									Rectangle.rectangleByOnePoint(
										hoverPos
											.map(c => Math.floor(c))
											.sub(camera.position)
											.map(c => c * camera.zoom)
											.add(Position.fromShape(this.worldLayer.resolution.map(c => c / 2))),
										Shape.square(camera.zoom)
									)
								)
								this.composeView()
							})
						})
				} else {
					this.interactionLayer.clear()
				}
			})
	}

	private drawMinimapView(camera: Camera, destinationRect: Rectangle): void {
		this.configService.renderConfig.observable.subscribe(config => {
			this.provideUnboundedCameras(camera, this.minimap.resolution, config.minimapResolution, unboundedCamera => {
				this.worldLayer.drawImage(
					this.minimap.canvas,
					destinationRect,
					unboundedCamera.getViewCameraRect(this.worldLayer.resolution, config.minimapResolution)
				)
			})
		})
	}

	private drawMapView(camera: Camera, destinationRect: Rectangle): void {
		this.configService.renderConfig.observable.subscribe(config => {
			this.provideUnboundedCameras(camera, this.map.resolution, config.tileResolution, unboundedCamera => {
				this.map.drawPartOn(
					unboundedCamera.getViewCameraRect(this.worldLayer.resolution, config.tileResolution),
					this.worldLayer,
					destinationRect
				)
			})
		})
	}

	private provideUnboundedCameras(camera: Camera, mapResolution: Shape, tileResolution: number, cameraSupplier: (camera: Camera) => void): void {
		const visibleWorldsShape = this.worldLayer.resolution
			.mapEach(
				w => w / (mapResolution.width * camera.zoom / tileResolution),
				h => h / (mapResolution.height * camera.zoom / tileResolution)
			)
			.map(s => Math.floor(s / 2) + 1)

		_.range(-visibleWorldsShape.width, visibleWorldsShape.width + 2).forEach(x => {
			_.range(-visibleWorldsShape.height, visibleWorldsShape.height + 2).forEach(y => {
				cameraSupplier(
					new Camera(
						camera.position.mapEach(
							c => c + (x * mapResolution.width / tileResolution),
							c => c + (y * mapResolution.height / tileResolution)
						),
						camera.zoom,
						camera.config
					)
				)
			})
		})
	}

	private drawChunks(tilemap: Matrix<Tile>): void {
		this.map.chunkMatrix.forEach((chunk, position) => {
			if (chunk.isDrawn) return
			this.drawChunk(position, tilemap)
		})
	}

	private drawChunk(chunkPosition: Position, tilemap: Matrix<Tile>): void {
		this.configService.renderConfig.observable.subscribe(config => {
			const chunkTileRect: Rectangle = Rectangle.rectangleByOnePoint(
				chunkPosition.map(c => c * config.chunkSize),
				Shape.square(config.chunkSize)
			)
			const chunkTilemap: Matrix<Tile> = tilemap.of(chunkTileRect)
			this.spriteRenderService.spriteRenderers.forEach(spriteRenderer => {
				chunkTilemap.forEach((tile: Tile, position: Position) => {
					if (!tile) return
					const tilePosition = position.add(chunkTileRect.topLeft)

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
							)
						})
				})
			})
		})
	}

	private drawMinimap(): void {
		this.configService.renderConfig.observable.subscribe(config => {
			this.map.chunkMatrix.forEach((chunk, position) => {
				this.minimap.drawImage(
					chunk.canvas,
					Rectangle
						.rectangleByOnePoint(
							position.map(c => c * config.chunkSize),
							Shape.square(config.chunkSize)
						)
						.multiply(config.minimapResolution)
				)
			})
			this.minimap.drawBorder(1, 'rgba(0, 0, 0, 0.3)')
		})
	}

	private drawMapSprite(sprite: HTMLImageElement, position: Position): void {
		this.configService.renderConfig.observable.subscribe(config => {
			const spriteRect = Rectangle.rectangleByOnePoint(
				position,
				new Shape(sprite.width, sprite.height).map(s =>
					(s / config.spriteResolution) * config.tileResolution
				)
			)
			this.map.drawImage(
				sprite,
				spriteRect
			)
		})
	}

}
