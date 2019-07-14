import {BehaviorSubject, Observable} from "rxjs";

export class ObservableData<T> {

	private subject;
	observable: Observable<T>;

	constructor(initialValue: T) {
		this.subject = new BehaviorSubject<T>(initialValue);
		this.observable = this.subject.asObservable();
	}

	set(value: T) {
		this.subject.next(value);
	}

}
