import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'
import {interval, Observable, timer} from 'rxjs'
import {flatMap, last, map, scan, takeUntil} from 'rxjs/operators'

@Injectable({
	providedIn: 'root'
})
export class RenderProfileService {

	frame: ObservableData<void> = new ObservableData<void>()
	ups: Observable<number>

	constructor() {
		this.ups = interval()
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
