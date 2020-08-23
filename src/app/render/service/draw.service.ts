import {Injectable, Injector} from '@angular/core'
import {Camera} from '../model/Camera'
import {Position} from '../../common/model/Position'
import {Shape} from '../../common/model/Shape'
import {RenderService} from './render.service'
import {ConfigService} from '../../common/service/config.service'
import {inject} from '../../common/util/inject'
import {SingleCanvas} from '../model/canvas/SingleCanvas'

@Injectable({
	providedIn: 'root'
})
export class DrawService {

	private renderService: RenderService

	constructor(
		private injector: Injector,
		private configService: ConfigService
	) {
		inject(injector, RenderService, injected => this.renderService = injected)
	}

	/**
	 * Draw a line between two tiles
	 *
	 * @param canvas
	 * @param camera
	 * @param pos1
	 * @param pos2
	 * @param lineWidth
	 * @param color
	 */
	drawLine(canvas: SingleCanvas, camera: Camera, pos1: Position, pos2: Position, lineWidth: number, color: string) {
		this.configService.renderConfig.observable.subscribe(renderConfig => {
			const valueToPixel: number = camera.zoom / (renderConfig.tileResolution / 2)
			const drawPos1 = this.renderService.mapTilePositionToDrawPosition(camera, pos1)
				.add(Position.fromShape(Shape.square(0.5)).map(c => c * camera.zoom))
			const drawPos2 = this.renderService.mapTilePositionToDrawPosition(camera, pos2)
				.add(Position.fromShape(Shape.square(0.5)).map(c => c * camera.zoom))
			if (camera.zoom > camera.config.minimapTriggerZoom) {
				canvas.drawLine(drawPos1, drawPos2, lineWidth * valueToPixel, color)
			}
		})
	}

	/**
	 * Draw a dot in the middle of a specified tile
	 *
	 * @param canvas
	 * @param camera
	 * @param position
	 * @param radius
	 * @param color
	 */
	drawDot(canvas: SingleCanvas, camera: Camera, position: Position, radius: number, color: string) {
		this.configService.renderConfig.observable.subscribe(renderConfig => {
			const valueToPixel: number = camera.zoom / (renderConfig.tileResolution / 2)
			const drawPosition = this.renderService.mapTilePositionToDrawPosition(camera, position)
				.add(Position.fromShape(Shape.square(0.5)).map(c => c * camera.zoom))
			if (camera.zoom > camera.config.minimapTriggerZoom) {
				canvas.drawCircle(drawPosition, radius * valueToPixel, color)
			}
		})
	}

}
