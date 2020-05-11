import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {ClockService} from './clock.service'
import {filter} from 'rxjs/operators'
import * as config from '../config/scheduling.config.json'

/**
 * Responsible for generation in game updates (ticks)
 */
@Injectable({
	providedIn: 'root'
})
export class ShortTermSchedulingService {

	/**
	 * Observable of the last long term tick
	 */
	tick: Observable<number>

	/**
	 * Construct service
	 */
	constructor(
		private clockService: ClockService
	) {
		this.tick = this.clockService.tick.observable
			.pipe(
				filter(tick => tick % config.shortTermK === 0)
			)
	}

}
