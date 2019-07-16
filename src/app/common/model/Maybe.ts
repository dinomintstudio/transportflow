/**
 * Class describing value than might exits
 */
export class Maybe<T> {

	/**
	 * Nullable value
	 */
	private value: T;

	/**
	 * Constructs new Maybe instance
	 * @param value
	 */
	constructor(value: T = null) {
		this.value = value;
	}

	/**
	 * @return true if value is present and not null
	 */
	isPresent(): Boolean {
		return this.value != null;
	}

	/**
	 * @return value
	 * @throws Error if value is not present
	 */
	get(): T {
		if (this.value == null) throw new Error('no value present');
		return this.value;
	}

	/**
	 * Apply consumer for the value if it's present
	 *
	 * Example:
	 * <pre>
	 *      maybeNumber.ifPresent((number) => {
	 *          console.log(number);
	 *      });
	 * </pre>
	 * If the number is present (i.e. 6) then output will be 6.
	 * If the number is not present (i.e. null) then there will be no output at all. Consumer function will not be
	 * called
	 *
	 * @param consumer consumer function
	 */
	ifPresent(consumer: (value: T) => void) {
		if (!this.isPresent()) return;
		consumer(this.value);
	}

	map<D>(func: (T) => D): Maybe<D> {
		return this.isPresent() ? new Maybe<D>(func(this.get())) : Maybe.empty();
	}

	/**
	 * If present returns value, otherwise returns elseValue
	 * @param elseValue returned value if current is not present
	 */
	orElse(elseValue: T): T {
		return this.isPresent() ? this.value : elseValue;
	}

	/**
	 * Throws @param error error if value is not present
	 * @param error to be thrown if value is not present
	 * @return value if it is present
	 * @throws @param error if value is not present
	 */
	orElseThrow(error: any): T {
		try {
			return this.get();
		} catch (e) {
			throw error;
		}
	}

	/**
	 * Initialize new Maybe instance with not present value
	 */
	static empty<T>(): Maybe<T> {
		return new Maybe<T>();
	}

}