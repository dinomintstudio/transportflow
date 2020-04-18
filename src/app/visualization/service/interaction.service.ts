import {Injectable} from '@angular/core';
import {interval} from "rxjs";
import {distinct, first, map, scan, withLatestFrom} from "rxjs/operators";
import {lerp} from "../../common/model/Lerp";
import * as renderConfig from "../config/render.config.json";
import {Camera} from "../model/Camera";
import {CameraService} from "./camera.service";
import {WorldService} from "../../game-logic/service/world.service";
import {MouseService} from "../../input/service/mouse.service";
import {RenderService} from "./render.service";

@Injectable({
	providedIn: 'root'
})
export class InteractionService {

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private mouseService: MouseService,
		private renderService: RenderService
	) {
		this.handleZoom();
	}

	private handleZoom() {
		interval()
			.pipe(
				withLatestFrom(this.cameraService.zoom, (_, z) => z),
				scan((current, next) => lerp(current, next, renderConfig.zoomAnimationSpeed)),
				map(z => Math.round(z * 100) / 100),
				distinct()
			)
			.subscribe(zoom => {
				this.cameraService.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.cameraService.camera.set(new Camera(
							camera.position,
							camera.config.zoomLimit.clamp(zoom),
							camera.config
						));
					});
			})
	}
}
