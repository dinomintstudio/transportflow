import {Injectable} from '@angular/core'
import {CameraService} from './camera.service'
import {Camera} from '../model/Camera'
import {Position} from '../../common/model/Position'
import {WorldService} from '../../game-logic/service/world.service'
import {SpriteService} from './sprite.service'
import {first} from 'rxjs/operators'
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
import {ConfigService} from '../../common/service/config.service'
import {SpriteResolverService} from './sprite-resolver.service'
import {PixelCanvas} from '../model/canvas/PixelCanvas'
import {InteractionLayerRenderService} from './interaction-layer-render.service'
import {DebugLayerRenderService} from './debug-layer-render.service'
import {WorldLayerRenderService} from './world-layer-render.service'

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

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private spriteService: SpriteService,
		private spriteResolverService: SpriteResolverService,
		private configService: ConfigService,
		private interactionLayerRenderService: InteractionLayerRenderService,
		private debugLayerRenderService: DebugLayerRenderService,
		private worldLayerRenderService: WorldLayerRenderService
	) {
		this.loadSprites(() => {
			this.initMap(() => {
				this.updateChunks(() => setTimeout(() => this.cameraService.camera.update(), 0))
				this.worldLayerRenderService.updateWorldLayer()
				this.interactionLayerRenderService.updateInteractionLayer()
				this.debugLayerRenderService.updateDebugLayer()
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
		this.worldLayerRenderService.canvas = new SingleCanvas(worldCanvas)
		this.interactionLayerRenderService.canvas = new SingleCanvas(interactionCanvas, true)
		this.debugLayerRenderService.canvas = new SingleCanvas(debugCanvas, true)

		window.addEventListener('resize', () =>
			this.resizeCanvas(new Shape(canvasContainer.offsetWidth, canvasContainer.offsetHeight))
		)
		window.dispatchEvent(new Event('resize'))
	}

	/**
	 * Map tile world map position to draw position on canvas based on current camera position and zoom
	 * TODO: move
	 *
	 * @param camera
	 * @param position
	 */
	mapTilePositionToDrawPosition(camera: Camera, position: Position): Position {
		return position
			.map(c => Math.floor(c))
			.sub(camera.position)
			.map(c => c * camera.zoom)
			.add(Position.fromShape(this.worldLayerRenderService.canvas.resolution.map(c => c / 2)))
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
	 * Resize canvases and update camera
	 * @param shape
	 */
	private resizeCanvas(shape: Shape): void {
		[this.worldLayerRenderService.canvas,
			this.interactionLayerRenderService.canvas,
			this.debugLayerRenderService.canvas
		].forEach(c => c.setResolution(shape))

		this.cameraService.camera.update()
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

}
