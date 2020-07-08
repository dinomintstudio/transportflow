import {Injectable} from '@angular/core'
import {Maybe} from '../model/Maybe'

/**
 * Matcher service
 */
@Injectable({
	providedIn: 'root'
})
export class MatcherService {

	constructor() {}

	/**
	 * Find element in map of cases by key.
	 * If element not found return empty maybe
	 * @param key
	 * @param cases
	 */
	match<K, V>(key: K, cases: Map<K, V>): Maybe<V> {
		return new Maybe(cases.get(key))
	}

}
