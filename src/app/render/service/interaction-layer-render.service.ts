import {Injectable, Injector} from '@angular/core'
import {first} from 'rxjs/operators'
import {InteractionService} from '../../input/service/interaction.service'
import {CameraService} from './camera.service'
import {DrawService} from './draw.service'
import {SingleCanvas} from '../model/canvas/SingleCanvas'
import {Camera} from '../model/Camera'
import {Position} from '../../common/model/Position'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'
import {SpriteService} from './sprite.service'
import {RenderService} from './render.service'
import {inject} from '../../common/util/inject'

@Injectable({
	providedIn: 'root'
})
export class InteractionLayerRenderService {

	/**
	 * Interaction canvas layer
	 */
	canvas: SingleCanvas

	private renderService: RenderService

	constructor(
		private injector: Injector,
		private interactionService: InteractionService,
		private cameraService: CameraService,
		private drawService: DrawService,
		private spriteService: SpriteService
	) {
		inject(injector, RenderService, injected => this.renderService = injected)
	}

	/**
	 * Update map view or minimap view based on zoom for each new camera and map update
	 */
	updateInteractionLayer(): void {
		this.interactionService.tileHover
			.subscribe(hoverPos => {
				this.cameraService.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.drawInteractionLayer(camera, hoverPos)
					})
			})
	}

	drawInteractionLayer(camera, hoverPos): void {
		this.drawHoverTile(camera, hoverPos)
	}

	/**
	 * Draw hovered tile highlight
	 *
	 * @param camera
	 * @param hoverPos
	 */
	drawHoverTile(camera: Camera, hoverPos: Position) {
		if (camera.zoom > camera.config.minimapTriggerZoom) {
			this.canvas.clear()
			this.canvas.drawImage(
				this.spriteService.fetch('hover').image,
				Rectangle.rectangleByOnePoint(
					this.renderService.mapTilePositionToDrawPosition(camera, hoverPos),
					Shape.square(camera.zoom)
				)
			)
		} else {
			this.canvas.clear()
		}
	}

}
