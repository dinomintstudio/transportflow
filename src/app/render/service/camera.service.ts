import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {Camera} from "../model/Camera";
import {KeyService} from "../../input/service/key.service";
import {Position} from "../../common/model/Position";
import {filter, first, flatMap, map, pairwise, withLatestFrom} from "rxjs/operators";
import {MouseService} from "../../input/service/mouse.service";
import {concat, merge, Observable, of} from "rxjs";


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

		;

	}

}
