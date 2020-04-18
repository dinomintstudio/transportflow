import {Injectable} from '@angular/core';
import {interval, Observable} from "rxjs";
import {distinct, first, map, scan, withLatestFrom} from "rxjs/operators";
import {lerp} from "../../common/model/Lerp";
import * as renderConfig from "../config/render.config.json";
import {Camera} from "../model/Camera";
import {CameraService} from "./camera.service";
import {WorldService} from "../../game-logic/service/world.service";
import {MouseService} from "../../input/service/mouse.service";
import {Position} from "../../common/model/Position";

@Injectable({
	providedIn: 'root'
})
export class InteractionService {

	tileHover: Observable<Position>;

	tileClick: Observable<Position>;

	constructor(
		private cameraService: CameraService,
		private worldService: WorldService,
		private mouseService: MouseService,
	) {
		this.handleZoom();

		this.tileHover = this.mouseService.mouseMove.observable
			.pipe(
				map(mouse => new Position(mouse.clientX, mouse.clientY)),
				// TODO: refactor
				// problem with circular dependency
				withLatestFrom(
					this.mouseService.mouseMove.observable,
					(pos, e) => pos
						.add(new Position(
							(<HTMLCanvasElement>e.srcElement).width,
							(<HTMLCanvasElement>e.srcElement).height
							).map(c => -c / 2)
						)
				),
				withLatestFrom(
					this.cameraService.camera.observable,
					(pos, camera) => pos
						.map(c => c / camera.zoom)
						.add(camera.position)
				),
				withLatestFrom(
					this.worldService.world.observable,
					(pos, world) => pos.mapEach(
						x => x > 0
							? x % world.tilemap.shape.width
							: world.tilemap.shape.width - x,
						y => y > 0
							? y % world.tilemap.shape.height
							: world.tilemap.shape.height - y,
					)
				)
			);

		this.tileClick = this.mouseService.mouseClick.observable
			.pipe(
				withLatestFrom(this.tileHover, (_, pos) => pos)
			);
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
			});
	}
}
