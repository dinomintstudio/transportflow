import {Injectable} from '@angular/core';
import {ClockService} from "./clock.service";
import {ObservableData} from "../../common/model/ObservableData";
import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import * as config from '../config/scheduling.config.json'

@Injectable({
	providedIn: 'root'
})
export class LongTermSchedulingService {

	tick: Observable<number>;

	constructor(
		private clockService: ClockService
	) {
		this.tick = this.clockService.tick.observable
			.pipe(
				filter(tick => tick % config.longTermK === 0)
			);
	}

}
