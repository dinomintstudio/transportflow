import {MonoTypeOperatorFunction, Observable} from 'rxjs'
import {skip, takeUntil} from 'rxjs/operators'

/**
 * Example:
 *
 * <pre>
 * a.subscribe(i => {
 *     b
 *         .pipe(untilNewFrom(a))
 *         .subscribe(() => ...)
 * })
 *
 * `b` will complete when `a` emit new value.
 * Use this when you need to stop nested observables from emitting when new outer observable's value emits.
 *
 * </pre>
 * @param o when o will emit new value, observable will complete
 */
export const untilNewFrom = <T, O>(o: Observable<O>): MonoTypeOperatorFunction<T> => {
	return (source) => source.pipe(takeUntil(o.pipe(skip(1))))
}
