import {Component, OnInit} from '@angular/core'
import {Shape} from '../../common/model/Shape'
import {RenderService} from '../../render/service/render.service'
import {WorldService} from '../../game-logic/service/world.service'
import {Camera} from '../../render/model/Camera'
import {CameraService} from '../../render/service/camera.service'
import {first, map} from 'rxjs/operators'
import {RenderProfileService} from '../../render/service/render-profile.service'
import {Position} from '../../common/model/Position'
import {InteractionService} from '../../input/service/interaction.service'
import {interval} from 'rxjs'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'

@Component({
	selector: 'app-debug-overlay',
	templateUrl: './debug-overlay.component.html',
	styleUrls: ['./debug-overlay.component.sass']
})
export class DebugOverlayComponent implements OnInit {

	ups: number
	maxFps: number
	mapSize: Shape
	chunks: Shape
	chunkSize: number
	mapTileResolution: number
	minimapTileResolution: number

	camera: Camera
	boundedCameraPosition: Position

	mousePosition: Position
	boundedMousePosition: Position

	// memory report in format <usedJSHeapSize>MB/<totalJSHeapSize>MB/<jsHeapSizeLimit>MB
	memory: string

	constructor(
		private renderService: RenderService,
		private renderProfileService: RenderProfileService,
		private worldService: WorldService,
		private cameraService: CameraService,
		private interactionService: InteractionService,
		private configService: ConfigService
	) {}

	ngOnInit(): void {
		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(renderConfig => {
				this.renderProfileService.ups
					.pipe(untilNewFrom(this.configService.renderConfig.observable))
					.subscribe(
						ups => this.ups = ups
					)

				this.maxFps = renderConfig.maxUps

				this.worldService.world.observable
					.pipe(untilNewFrom(this.configService.renderConfig.observable))
					.subscribe(
						world => this.mapSize = world.tilemap.shape
					)

				this.chunks = this.renderService.map.chunkMatrix.shape

				this.chunkSize = this.renderService.map.chunkSize / renderConfig.tileResolution

				this.mapTileResolution = renderConfig.tileResolution

				this.cameraService.camera.observable
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable),
						map(c => new Camera(
							c.position.map(Math.floor),
							c.zoom,
							c.config)
						)
					)
					.subscribe(
						camera => {
							this.camera = camera
						}
					)

				this.cameraService.camera.observable
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable),
						map(c => c.position),
						this.worldService.boundPosition(),
						map(c => c.map(Math.floor))
					)
					.subscribe(pos => this.boundedCameraPosition = pos)

				this.interactionService.tileHover
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable)
					)
					.subscribe(mousePos => this.mousePosition = mousePos)

				this.interactionService.tileHover
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable),
						this.worldService.boundPosition()
					)
					.subscribe(mousePos => this.boundedMousePosition = mousePos)

				// @ts-ignore
				if (performance.memory) {
					// @ts-ignore
					interval(1000).subscribe(() => this.memory = this.formatMemory(performance.memory))
				}
			})
	}

	formatMemory(memoryInfo: any): string {
		return [
			memoryInfo.usedJSHeapSize,
			memoryInfo.totalJSHeapSize,
			memoryInfo.jsHeapSizeLimit
		]
			.map(m => Math.floor(m / 1000000) + 'MB')
			.join('/')
	}

}
