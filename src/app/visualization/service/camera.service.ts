import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {Camera} from "../model/Camera";
import {KeyService} from "../../input/service/key.service";
import {Position} from "../../common/model/Position";
import {distinct, filter, first, flatMap, map, pairwise, scan, withLatestFrom} from "rxjs/operators";
import {MouseService} from "../../input/service/mouse.service";
import {concat, interval, merge, Observable, of} from "rxjs";
import * as renderConfig from '../config/render.config.json'
import {lerp} from "../../common/model/Lerp";


@Injectable({
	providedIn: 'root'
})
export class CameraService {

	camera: ObservableData<Camera> = new ObservableData();

	zoom: Observable<number>;

	constructor(
		private keyService: KeyService,
		private mouseService: MouseService
	) {
		this.zoom = this.camera.observable
			.pipe(
				first(),
				flatMap(camera =>
					concat(
						of(camera.zoom),
						merge(
							this.mouseService.zoomIn.observable
								.pipe(
									withLatestFrom(this.camera.observable, (_, c) => c),
									map(c => c.zoom * c.config.zoomFactor)
								),
							this.mouseService.zoomOut.observable
								.pipe(
									withLatestFrom(this.camera.observable, (_, c) => c),
									map(c => c.zoom / c.config.zoomFactor)
								),
						)
					))
			)

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
						));
					});
			})

		interval()
			.pipe(
				withLatestFrom(this.zoom, (_, z) => z),
				scan((current, next) => lerp(current, next, renderConfig.zoomAnimationSpeed)),
				map(z => Math.round(z * 100) / 100),
				distinct()
			)
			.subscribe(zoom => {
				this.camera.observable
					.pipe(first())
					.subscribe(camera => {
						this.camera.set(new Camera(
							camera.position,
							camera.config.zoomLimit.clamp(zoom),
							camera.config
						));
					});
			});

	}

}
