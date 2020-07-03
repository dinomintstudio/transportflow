import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'
import {Camera} from '../model/Camera'
import {KeyService} from '../../input/service/key.service'
import {Position} from '../../common/model/Position'
import {filter, first, map, pairwise} from 'rxjs/operators'
import {MouseService} from '../../input/service/mouse.service'


/**
 * Provides camera related observables
 */
@Injectable({
	providedIn: 'root'
})
export class CameraService {

	camera: ObservableData<Camera>
	zoom: ObservableData<number>

	constructor(
		private keyService: KeyService,
		private mouseService: MouseService
	) {
		this.camera = new ObservableData()
		this.zoom = new ObservableData()
		this.updateCameraPosition()
		this.handleZoom()
	}

	/**
	 * Move camera position on mouse drag
	 */
	private updateCameraPosition() {
		this.mouseService.mouseDrag.observable
			.pipe(
				pairwise(),
				filter(([e1, e2]: [MouseEvent, MouseEvent]) => Math.abs(e1.timeStamp - e2.timeStamp) < 100),
				map((pair: [MouseEvent, MouseEvent]) => pair.map(e => new Position(e.clientX, e.clientY))),
				map(([p1, p2]: [Position, Position]) => p1.sub(p2)),
			)
			.subscribe(p => {
				this.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.camera.set(new Camera(
							camera.position.add(
								new Position(
									p.x / camera.zoom,
									p.y / camera.zoom
								)
							),
							camera.zoom,
							camera.config
						))
					})
			})
	}

	/**
	 * Change camera zoom according to zoom events
	 */
	private handleZoom() {
		this.camera.observable
			.pipe(first())
			.subscribe(camera => {
				this.zoom.set(camera.zoom)
				this.mouseService.zoomIn.observable.subscribe(() => {
					this.zoom.observable
						.pipe(first())
						.subscribe(zoom => this.zoom.set(
							camera.config.zoomLimit.clamp(
								zoom * camera.config.zoomFactor
							)
						))
				})
				this.mouseService.zoomOut.observable.subscribe(() => {
					this.zoom.observable
						.pipe(first())
						.subscribe(zoom => this.zoom.set(
							camera.config.zoomLimit.clamp(
								zoom / camera.config.zoomFactor
							)
						))
				})
			})
	}
}
