import {Injectable, Injector} from '@angular/core'
import {first, throttleTime} from 'rxjs/operators'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'
import {Camera} from '../model/Camera'
import {Rectangle} from '../../common/model/Rectangle'
import {Position} from '../../common/model/Position'
import {Shape} from '../../common/model/Shape'
import {InteractionService} from '../../input/service/interaction.service'
import {CameraService} from './camera.service'
import {inject} from '../../common/util/inject'
import {RenderService} from './render.service'
import {ConfigService} from '../../common/service/config.service'
import {WorldService} from '../../game-logic/service/world.service'
import {RenderProfileService} from './render-profile.service'
import {InteractionLayerRenderService} from './interaction-layer-render.service'
import * as _ from 'lodash'
import {SingleCanvas} from '../model/canvas/SingleCanvas'

@Injectable({
	providedIn: 'root'
})
export class WorldLayerRenderService {

	/**
	 * World canvas layer
	 */
	canvas: SingleCanvas

	private renderService: RenderService

	constructor(
		private injector: Injector,
		private interactionService: InteractionService,
		private cameraService: CameraService,
		private configService: ConfigService,
		private worldService: WorldService,
		private renderProfileService: RenderProfileService,
		private interactionLayerRenderService: InteractionLayerRenderService
	) {
		inject(injector, RenderService, injected => this.renderService = injected)
	}

	/**
	 * Update world layer for each new camera update
	 */
	updateWorldLayer(): void {
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
								if (!this.canvas) return
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
									this.canvas.resolution
								)

								if (cyclicCamera.zoom > cyclicCamera.config.minimapTriggerZoom) {
									this.drawMapOnWorldLayer(cyclicCamera, destinationRect)
									this.interactionService.tileHover
										.pipe(first())
										.subscribe(hoverPos => {
											this.interactionLayerRenderService.drawInteractionLayer(camera, hoverPos)
										})
								} else {
									this.drawMinimapOnWorldLayer(cyclicCamera, destinationRect)
								}
							})
					})
			})
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
				this.provideUnboundedCameras(camera, this.renderService.map.resolution, config.tileResolution, unboundedCamera => {
					this.renderService.map.drawPartOn(
						unboundedCamera.getViewCameraRect(this.canvas.resolution, config.tileResolution),
						this.canvas,
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
		this.provideUnboundedCameras(camera, this.renderService.minimap.resolution, 1, unboundedCamera => {
			this.canvas.drawImage(
				this.renderService.minimap.canvas,
				destinationRect,
				unboundedCamera.getViewCameraRect(this.canvas.resolution, 1)
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
		const visibleWorldsShape = this.canvas.resolution
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

}
