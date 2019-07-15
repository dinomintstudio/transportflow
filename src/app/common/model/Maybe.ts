export class Maybe<T> {

	private value: T;

	constructor(value: T = null) {
		this.value = value;
	}

	isPresent(): Boolean {
		return this.value != null;
	}

	get(): T {
		if (this.value == null) throw new Error('no value present');
		return this.value;
	}

	ifPresent(consumer: (value: T) => void) {
		if (!this.isPresent()) return;
		consumer(this.value);
	}

	orElse(elseValue: T): T {
		return this.isPresent() ? this.value : elseValue;
	}

	orElseThrow(error: any): T {
		try {
			return this.get();
		} catch (e) {
			throw error;
		}
	}

}