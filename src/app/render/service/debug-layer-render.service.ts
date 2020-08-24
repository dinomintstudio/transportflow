import {Injectable, Injector} from '@angular/core'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'
import {Camera} from '../model/Camera'
import {CameraService} from './camera.service'
import {DrawService} from './draw.service'
import {RenderDebugService} from './render-debug.service'
import {RenderService} from './render.service'
import {inject} from '../../common/util/inject'
import {SingleCanvas} from '../model/canvas/SingleCanvas'
import {filter, first} from 'rxjs/operators'
import {ConfigService} from '../../common/service/config.service'
import {RoadService} from '../../game-logic/service/road.service'
import {NavigationService} from '../../game-logic/service/navigation.service'
import {zipAdjacent} from '../../common/util/zip-adjacent'

@Injectable({
	providedIn: 'root'
})
export class DebugLayerRenderService {

	/**
	 * Debug canvas layer
	 */
	canvas: SingleCanvas

	private renderService: RenderService

	constructor(
		private injector: Injector,
		private cameraService: CameraService,
		private drawService: DrawService,
		private renderDebugService: RenderDebugService,
		private configService: ConfigService,
		private roadService: RoadService,
		private navigationService: NavigationService
	) {
		inject(injector, RenderService, injected => this.renderService = injected)
	}

	updateDebugLayer(): void {
		this.navigationService.currentRoute.observable.subscribe(() => this.cameraService.camera.update())

		this.cameraService.camera.observable
			.subscribe(camera => {
				this.renderDebugService.overlayVisible.observable
					.pipe(untilNewFrom(this.cameraService.camera.observable))
					.subscribe(visible => {
						this.canvas.clear()
						if (visible) {
							this.drawDebugLayer(camera)
						}
					})
			})
	}

	drawDebugLayer(camera: Camera): void {
		this.drawRoadNetwork(camera)
		this.drawCurrentRoute(camera)
	}

	drawRoadNetwork(camera: Camera): void {
		this.roadService.intersectionNetwork.observable
			.pipe(
				filter(n => !!n),
				first()
			)
			.subscribe(network => {
				network.getEdges().forEach(edge => {
					this.drawService.drawLine(this.canvas, camera, edge.nodes[0].key, edge.nodes[1].key, 2, 'red')
				})
				network.getNodes().forEach(node => {
					this.drawService.drawDot(this.canvas, camera, node.key, 4, 'yellow')
				})
				network.getEdges().forEach(edge => {
					const nodes = edge.value.dfs(edge.nodes[0].key)

					nodes.forEach((node, i) => {

						this.drawService.drawDot(
							this.canvas,
							camera,
							node.value.position,
							2,
							`hsl(120, 100%, ${((i as any) / (nodes.length - 1)) * 100}%)`
						)
					})
				})
			})
	}

	drawCurrentRoute(camera: Camera): void {
		this.navigationService.currentRoute.observable
			.pipe(first())
			.subscribe(route => {
				zipAdjacent(route)
					.forEach(([road1, road2], i) => {
						this.drawService.drawLine(
							this.canvas,
							camera,
							road1,
							road2,
							6,
							`hsl(${((i as any) / (route.length - 1)) * 360}, 100%, 50%)`
						)
					})
			})
	}

}
