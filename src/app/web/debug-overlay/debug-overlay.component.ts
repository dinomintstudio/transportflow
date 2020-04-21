import {Component, OnInit} from '@angular/core';
import {Shape} from "../../common/model/Shape";
import {RenderService} from "../../visualization/service/render.service";
import * as renderConfig from '../../visualization/config/render.config.json'
import {WorldService} from "../../game-logic/service/world.service";
import {Camera} from "../../visualization/model/Camera";
import {CameraService} from "../../visualization/service/camera.service";
import {filter, map} from "rxjs/operators";
import {RenderProfileService} from "../../visualization/service/render-profile.service";
import {KeyService} from "../../input/service/key.service";
import {Position} from "../../common/model/Position";
import {InteractionService} from "../../visualization/service/interaction.service";
import {interval} from "rxjs";

@Component({
	selector: 'app-debug-overlay',
	templateUrl: './debug-overlay.component.html',
	styleUrls: ['./debug-overlay.component.scss']
})
export class DebugOverlayComponent implements OnInit {

	ups: number;
	maxFps: number;
	mapSize: Shape;
	chunks: Shape;
	chunkSize: number;
	mapTileResolution: number;
	minimapTileResolution: number;

	camera: Camera;
	boundedCameraPosition: Position;

	mousePosition: Position;
	boundedMousePosition: Position;

	// memory report in format <usedJSHeapSize>MB/<totalJSHeapSize>MB/<jsHeapSizeLimit>MB
	memory: string;

	visible: boolean;

	constructor(
		private renderService: RenderService,
		private renderProfileService: RenderProfileService,
		private worldService: WorldService,
		private cameraService: CameraService,
		private keyService: KeyService,
		private interactionService: InteractionService
	) {
		this.visible = false;
	}

	ngOnInit(): void {
		this.renderProfileService.ups.subscribe(
			ups => this.ups = ups
		);

		this.maxFps = renderConfig.maxFps

		this.worldService.world.observable.subscribe(
			world => this.mapSize = world.tilemap.shape
		);

		this.chunks = this.renderService.map.chunkMatrix.shape;

		this.chunkSize = this.renderService.map.chunkSize / renderConfig.tileResolution;

		this.mapTileResolution = renderConfig.tileResolution;
		this.minimapTileResolution = renderConfig.minimapResolution;

		this.cameraService.camera.observable
			.pipe(
				map(c => new Camera(
					c.position.map(Math.floor),
					c.zoom,
					c.config)
				)
			)
			.subscribe(
				camera => {
					this.camera = camera;
				}
			);

		this.cameraService.camera.observable
			.pipe(
				map(c => c.position),
				this.worldService.boundPosition(),
				map(c => c.map(Math.floor))
			)
			.subscribe(pos => this.boundedCameraPosition = pos);

		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === renderConfig.debugOverlayKey)
			)
			.subscribe(e => {
				this.toggle();
				e.preventDefault();
			});

		this.interactionService.tileHover
			.pipe(
				map(pos => pos.map(Math.floor))
			)
			.subscribe(mousePos => this.mousePosition = mousePos);

		this.interactionService.tileHover
			.pipe(
				map(pos => pos.map(Math.floor)),
				this.worldService.boundPosition()
			)
			.subscribe(mousePos => this.boundedMousePosition = mousePos);

		// @ts-ignore
		if (performance.memory) {
			// @ts-ignore
			interval(1000).subscribe(() => this.memory = this.formatMemory(performance.memory));
		}
	}

	toggle(): void {
		this.visible = !this.visible;
	}

	formatMemory(memoryInfo: any): string {
		return [
			memoryInfo.usedJSHeapSize,
			memoryInfo.totalJSHeapSize,
			memoryInfo.jsHeapSizeLimit
		]
			.map(m => Math.floor(m / 1000000) + 'MB')
			.join('/');
	}

}
