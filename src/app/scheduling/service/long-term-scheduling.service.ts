import {Injectable} from '@angular/core';
import {ClockService} from "./clock.service";
import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import * as config from '../config/scheduling.config.json'

/**
 * Responsible for generation in game updates (ticks)
 */
@Injectable({
	providedIn: 'root'
})
export class LongTermSchedulingService {

	/**
	 * Observable of the last long term tick
	 */
	tick: Observable<number>;

	/**
	 * Construct service
	 */
	constructor(
		private clockService: ClockService
	) {
		this.tick = this.clockService.tick.observable
			.pipe(
				filter(tick => tick % config.longTermK === 0)
			);
	}

}
