import {Injectable} from '@angular/core';
import {interval, MonoTypeOperatorFunction, Observable} from "rxjs";
import {distinctUntilChanged, first, map, scan, withLatestFrom} from "rxjs/operators";
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
				)
			);

		this.tileClick = this.mouseService.mouseClick.observable
			.pipe(
				withLatestFrom(this.tileHover, (_, pos) => pos)
			);
	}

	/**
	 * Map unbounded world position to bounded position.
	 * For example, if world map is [32, 32] tiles and input position is [-2, 40], output will be [30, 8].
	 */
	public boundPosition(): MonoTypeOperatorFunction<Position> {
		return withLatestFrom(
			this.worldService.world.observable,
			(pos, world) => pos.mapEach(
				x => x > 0
					? x % world.tilemap.shape.width
					: world.tilemap.shape.width - x,
				y => y > 0
					? y % world.tilemap.shape.height
					: world.tilemap.shape.height - y,
			)
		);
	}

	private handleZoom() {
		interval()
			.pipe(
				withLatestFrom(this.cameraService.zoom, (_, z) => z),
				scan((current, next) => lerp(current, next, renderConfig.zoomAnimationSpeed)),
				map(z => Math.round(z * 100) / 100),
				distinctUntilChanged()
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
