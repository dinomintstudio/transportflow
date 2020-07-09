import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'
import {interval, Observable, timer} from 'rxjs'
import {flatMap, last, map, scan, takeUntil} from 'rxjs/operators'

/**
 * Supply profiling information about render process
 */
@Injectable({
	providedIn: 'root'
})
export class RenderProfileService {

	/**
	 * Fires on each world layer render update
	 */
	frame: ObservableData<void> = new ObservableData<void>()

	/**
	 * Updates per second.
	 * Counts how many frames was fired during last second
	 */
	ups: Observable<number>

	constructor() {
		this.ups = interval(1000)
			.pipe(
				flatMap(() =>
					this.frame.observable.pipe(
						takeUntil(timer(1000)),
						map(v => 0),
						scan((a, n) => a + 1, 0),
						last()
					)
				)
			)
	}
}
