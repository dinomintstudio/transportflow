import {BehaviorSubject, Observable} from 'rxjs'
import {filter, first} from 'rxjs/operators'

/**
 * Object wrapper for reactive use. Set object value with `set()` method. Subscribe to it's value using `observable`
 * field
 */
export class ObservableData<T> {

	/**
	 * ReactiveX `Subject` of an object
	 */
	private subject: BehaviorSubject<T>

	/**
	 * Observable of object. Used to share object state. Emits each time the `set()` method is called
	 */
	observable: Observable<T>

	/**
	 * Construct new ObservableData instance. Initial value cannot be null. Any null value will not be emitted
	 * @param initialValue initial value
	 */
	constructor(initialValue: T = null) {
		this.subject = new BehaviorSubject<T>(initialValue)
		this.observable = this.subject
			.asObservable()
			.pipe(
				filter(x => x !== null)
			)
	}

	/**
	 * Used to set new object's value. Each time it's set - new event is emitted from `observable` field
	 * @param value
	 */
	set(value: T) {
		this.subject.next(value)
	}

	update(): void {
		this.observable
			.pipe(first())
			.subscribe(value => {
				this.subject.next(value)
			})
	}

}
