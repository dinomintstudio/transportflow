import {Injectable} from '@angular/core'
import {CameraService} from './camera.service'
import {Camera} from '../model/Camera'
import {Position} from '../../common/model/Position'
import {WorldService} from '../../game-logic/service/world.service'
import {SpriteService} from './sprite.service'
import {filter, first, throttleTime} from 'rxjs/operators'
import {World} from '../../game-logic/model/World'

import {Tile} from '../../game-logic/model/Tile'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'
import {Matrix} from '../../common/model/Matrix'
import {SingleCanvas} from '../model/canvas/SingleCanvas'
import {ChunkedCanvas} from '../model/canvas/ChunkedCanvas'
import {createCanvas} from '../model/canvas/Canvas'
import {CameraConfig} from '../config/CameraConfig'
import {Range} from '../../common/model/Range'
import {Log} from '../../common/model/Log'
import * as _ from 'lodash'
import {InteractionService} from '../../input/service/interaction.service'
import {RenderProfileService} from './render-profile.service'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'
import {SpriteResolverService} from './sprite-resolver.service'
import {PixelCanvas} from '../model/canvas/PixelCanvas'
import {RoadService} from '../../game-logic/service/road.service'
import {RenderDebugService} from './render-debug.service'

/**
 * Responsible for rendering canvases and updating map
 */
@Injectable({
	providedIn: 'root'
})
export class RenderService {

	log: Log = new Log(this)

	/**
	 * Off-screen world map
	 */
	map: ChunkedCanvas

	/**
	 * Off-screen world minimap
	 */
	minimap: PixelCanvas

	/**
	 * World canvas layer
	 */
	worldCanvas: SingleCanvas

	/**
	 * Interaction canvas layer
	 */
	interactionCanvas: SingleCanvas

	/**
	 * Debug canvas layer
	 */
	debugCanvas: SingleCanvas

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService,
		private spriteResolverService: SpriteResolverService,
		private interactionService: InteractionService,
		private renderProfileService: RenderProfileService,
		private configService: ConfigService,
		private roadService: RoadService,
		private renderDebugService: RenderDebugService
	) {
		this.loadSprites(() => {
			this.initMap(() => {
				this.updateChunks(() => setTimeout(() => this.cameraService.camera.update(), 0))
				this.updateWorldLayer()
				this.updateInteractionLayer()
				this.updateDebugLayer()
			})
		})
	}

	/**
	 * Initialize canvas layers
	 * @param worldCanvas
	 * @param interactionCanvas
	 * @param debugCanvas
	 * @param canvasContainer
	 */
	initView(worldCanvas: HTMLCanvasElement,
	         interactionCanvas: HTMLCanvasElement,
	         debugCanvas: HTMLCanvasElement,
	         canvasContainer: HTMLElement): void {
		this.log.debug('initialize render view')
		this.worldCanvas = new SingleCanvas(worldCanvas)
		this.interactionCanvas = new SingleCanvas(interactionCanvas, true)
		this.debugCanvas = new SingleCanvas(debugCanvas, true)

		window.addEventListener('resize', () =>
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight))
		)
		window.dispatchEvent(new Event('resize'))
	}

	/**
	 * Load and cache sprites
	 * @param loaded callback of successful load
	 */
	private loadSprites(loaded?: () => void) {
		this.log.debug('load sprites')
		const startLoadSprites = new Date()
		this.spriteService.loadSprites(() => loaded?.())
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
						this.minimap = new PixelCanvas(
							createCanvas(world.tilemap.shape),
							false
						)

						this.log.debug('set initial camera')
						this.cameraService.camera.set(new Camera(
							Position.fromShape(world.tilemap.shape).map(c => c / 2),
							config.tileResolution,
							new CameraConfig(
								new Range(1, 1000),
								8
							)
						))

						complete?.()
					})
			})
	}

	/**
	 * Update map and minimap on world changes
	 * TODO: optimize; draw only visible chunks with specified overhead
	 * TODO: optimize; redraw only changed chunks
	 * TODO: notify what tiles need update
	 * @param complete update complete callback
	 */
	private updateChunks(complete?: () => void): void {
		this.worldService.world.observable
			.pipe(first())
			.subscribe(world => {
				this.log.debug('draw visible chunks')
				const startDrawChunks = new Date()
				this.drawChunks(world.tilemap)
				this.log.debug(`drawn visible chunks in ${(new Date().getTime() - startDrawChunks.getTime())}ms`)

				this.log.debug('draw minimap')
				const startDrawMinimap = new Date()
				this.drawMinimap(world.tilemap)
				this.log.debug(`drawn minimap in ${(new Date().getTime() - startDrawMinimap.getTime())}ms`)

				complete?.()
			})
	}

	/**
	 * Update world layer for each new camera update
	 */
	private updateWorldLayer(): void {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(config => {
				this.worldService.world.observable
					.pipe(first())
					.subscribe(world => {
						this.cameraService.camera.observable
							.pipe(
								untilNewFrom(this.configService.renderConfig.observable),
								throttleTime(1000 / (config.maxUps || Infinity))
							)
							.subscribe(camera => {
								if (!this.worldCanvas) return
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
									this.worldCanvas.resolution
								)

								if (cyclicCamera.zoom > cyclicCamera.config.minimapTriggerZoom) {
									this.drawMapOnWorldLayer(cyclicCamera, destinationRect)
									this.interactionService.tileHover
										.pipe(first())
										.subscribe(hoverPos => {
											this.drawInteractionLayer(camera, hoverPos)
										})
								} else {
									this.drawMinimapOnWorldLayer(cyclicCamera, destinationRect)
								}
							})
					})
			})
	}

	/**
	 * Update map view or minimap view based on zoom for each new camera and map update
	 */
	private updateInteractionLayer(): void {
		this.interactionService.tileHover
			.subscribe(hoverPos => {
				this.cameraService.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.drawInteractionLayer(camera, hoverPos)
					})
			})
	}

	private drawInteractionLayer(camera, hoverPos): void {
		this.drawHoverTile(camera, hoverPos)
	}

	private updateDebugLayer(): void {
		this.cameraService.camera.observable
			.subscribe(camera => {
				this.renderDebugService.overlayVisible.observable
					.pipe(untilNewFrom(this.cameraService.camera.observable))
					.subscribe(visible => {
						this.debugCanvas.clear()
						if (visible) {
							this.drawDebugLayer(camera)
						}
					})
			})
	}

	private drawDebugLayer(camera: Camera): void {
		this.drawRoadNetwork(camera)
	}

	/**
	 * TODO: move to separate service when more of such draws appear
	 *
	 * @param camera
	 * @private
	 */
	private drawRoadNetwork(camera: Camera): void {
		this.roadService.roadNetwork.observable
			.pipe(
				filter(n => !!n),
				first()
			)
			.subscribe(network => {
				network.getEdges().forEach(edge => {
					this.drawLine(camera, edge.nodes[0].key, edge.nodes[1].key)
				})
			})
	}

	/**
	 * Resize canvases and update camera
	 * @param shape
	 */
	private resizeCanvas(shape: Shape): void {
		[this.worldCanvas, this.interactionCanvas, this.debugCanvas].forEach(c => c.setResolution(shape))
		this.cameraService.camera.update()
	}

	/**
	 * Draw map on world layer
	 * @param camera
	 * @param destinationRect
	 */
	private drawMapOnWorldLayer(camera: Camera, destinationRect: Rectangle): void {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(config => {
				this.provideUnboundedCameras(camera, this.map.resolution, config.tileResolution, unboundedCamera => {
					this.map.drawPartOn(
						unboundedCamera.getViewCameraRect(this.worldCanvas.resolution, config.tileResolution),
						this.worldCanvas,
						destinationRect
					)
				})
			})
	}

	/**
	 * Draw minimap on world layer
	 * @param camera
	 * @param destinationRect
	 */
	private drawMinimapOnWorldLayer(camera: Camera, destinationRect: Rectangle): void {
		this.provideUnboundedCameras(camera, this.minimap.resolution, 1, unboundedCamera => {
			this.worldCanvas.drawImage(
				this.minimap.canvas,
				destinationRect,
				unboundedCamera.getViewCameraRect(this.worldCanvas.resolution, 1)
			)
		})
	}

	/**
	 * Generate all cameras for drawing visible unbounded tiles.
	 * Unbounded means visible due to infinite nature of the enclosed map
	 * @param camera
	 * @param mapResolution
	 * @param tileResolution
	 * @param cameraSupplier
	 */
	private provideUnboundedCameras(camera: Camera, mapResolution: Shape, tileResolution: number, cameraSupplier: (camera: Camera) => void): void {
		const visibleWorldsShape = this.worldCanvas.resolution
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

	/**
	 * Draw all chunks on map canvas
	 * @param tilemap
	 */
	private drawChunks(tilemap: Matrix<Tile>): void {
		this.map.chunkMatrix.forEach((chunk, position) => {
			if (chunk.isDrawn) return
			this.drawChunk(position, tilemap)
		})
	}

	/**
	 * Draw single chunk on map canvas
	 * @param chunkPosition
	 * @param tilemap
	 */
	private drawChunk(chunkPosition: Position, tilemap: Matrix<Tile>): void {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(config => {
				const chunkTileRect: Rectangle = Rectangle.rectangleByOnePoint(
					chunkPosition.map(c => c * config.chunkSize),
					Shape.square(config.chunkSize)
				)
				const chunkTilemap: Matrix<Tile> = tilemap.of(chunkTileRect)
				this.spriteResolverService.mapSpriteResolvers.forEach(spriteResolver => {
					chunkTilemap.forEach((tile: Tile, position: Position) => {
						if (!tile) return
						const tilePosition = position.add(chunkTileRect.topLeft)

						spriteResolver
							.getSprite(
								tile,
								spriteResolver.needAdjacentTiles
									? this.worldService.getAdjacentTileMatrix(tilemap, tilePosition)
									: null
							)
							.ifPresent(sprite => {
								this.drawMapSprite(
									this.spriteService.fetch(sprite).image,
									tilePosition.map(c => c * config.tileResolution)
								)
							})
					})
				})
			})
	}

	/**
	 * Draw each map chunk on minimap canvas
	 */
	private drawMinimap(tilemap: any): void {
		this.spriteResolverService.miniMapSpriteResolvers.forEach(spriteResolver => {
			tilemap.forEach((tile, position) => {
				spriteResolver.getSprite(
					tile,
					spriteResolver.needAdjacentTiles
						? this.worldService.getAdjacentTileMatrix(tilemap, position)
						: null
				).ifPresent(spriteName => {
					const sprite = this.spriteService.fetch(spriteName)
					this.minimap.drawRect(Rectangle.rectangleByOnePoint(position, sprite.tileSize), sprite.color)
				})
			})
		})
		this.minimap.drawBorder('rgba(0, 0, 0, 0.3)')
	}

	/**
	 * Draw sprite on map canvas
	 * @param sprite
	 * @param position
	 */
	private drawMapSprite(sprite: HTMLImageElement, position: Position): void {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(config => {
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

	/**
	 * Draw hovered tile highlight
	 * TODO: move to separate service when more of such draws appear
	 *
	 * @param camera
	 * @param hoverPos
	 */
	private drawHoverTile(camera: Camera, hoverPos: Position) {
		if (camera.zoom > camera.config.minimapTriggerZoom) {
			this.interactionCanvas.clear()
			this.interactionCanvas.drawImage(
				this.spriteService.fetch('hover').image,
				Rectangle.rectangleByOnePoint(
					this.mapTilePositionToDrawPosition(camera, hoverPos),
					Shape.square(camera.zoom)
				)
			)
		} else {
			this.interactionCanvas.clear()
		}
	}

	/**
	 * Draw a line between two tiles
	 * TODO: move to separate service when more of such draws appear
	 *
	 * @param camera
	 * @param pos1
	 * @param pos2
	 */
	private drawLine(camera: Camera, pos1: Position, pos2: Position) {
		this.configService.renderConfig.observable.subscribe(renderConfig => {
			const drawPos1 = this.mapTilePositionToDrawPosition(camera, pos1)
				.add(Position.fromShape(Shape.square(0.5)).map(c => c * camera.zoom))
			const drawPos2 = this.mapTilePositionToDrawPosition(camera, pos2)
				.add(Position.fromShape(Shape.square(0.5)).map(c => c * camera.zoom))
			if (camera.zoom > camera.config.minimapTriggerZoom) {
				this.debugCanvas.drawLine(drawPos1, drawPos2, 2, 'red')
			}
		})
	}

	private mapTilePositionToDrawPosition(camera: Camera, position: Position): Position {
		return position
			.map(c => Math.floor(c))
			.sub(camera.position)
			.map(c => c * camera.zoom)
			.add(Position.fromShape(this.worldCanvas.resolution.map(c => c / 2)))
	}
}
