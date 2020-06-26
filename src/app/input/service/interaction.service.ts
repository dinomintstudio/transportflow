import {Injectable} from '@angular/core'
import {interval, Observable} from 'rxjs'
import {distinctUntilChanged, first, map, scan, withLatestFrom} from 'rxjs/operators'
import {lerp} from '../../common/model/Lerp'
import {Camera} from '../../render/model/Camera'
import {CameraService} from '../../render/service/camera.service'
import {WorldService} from '../../game-logic/service/world.service'
import {MouseService} from './mouse.service'
import {Position} from '../../common/model/Position'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'

@Injectable({
	providedIn: 'root'
})
export class InteractionService {

	tileHover: Observable<Position>
	tileClick: Observable<Position>

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private mouseService: MouseService,
		private configService: ConfigService
	) {
		this.handleZoom()

		this.tileHover = this.mouseService.mouseMove.observable
			.pipe(
				map(mouse => new Position(mouse.clientX, mouse.clientY)),
				// TODO: refactor
				// problem with circular dependency
				withLatestFrom(
					this.mouseService.mouseMove.observable,
					(pos, e) => pos
						.add(new Position(
							(<HTMLCanvasElement>e.target).width,
							(<HTMLCanvasElement>e.target).height
							).map(c => -c / 2)
						)
				),
				withLatestFrom(
					this.cameraService.camera.observable,
					(pos, camera) => pos
						.map(c => c / camera.zoom)
						.add(camera.position)
				)
			)

		this.tileClick = this.mouseService.mouseClick.observable
			.pipe(
				withLatestFrom(this.tileHover, (_, pos) => pos)
			)
	}

	private handleZoom() {
		this.configService.renderConfig.observable.subscribe(renderConfig => {
			interval()
				.pipe(
					untilNewFrom(this.configService.renderConfig.observable),
					withLatestFrom(this.cameraService.zoom, (_, z) => z),
					scan((current, next) => lerp(current, next, renderConfig.zoomAnimationSpeed)),
					map(z => Math.round(z * 10) / 10),
					distinctUntilChanged(),
				)
				.subscribe(zoom => {
					this.cameraService.camera.observable
						.pipe(first())
						.subscribe(camera => {
							this.cameraService.camera.set(new Camera(
								camera.position,
								camera.config.zoomLimit.clamp(zoom),
								camera.config
							))
						})
				})
		})
	}
}
