import {Injectable} from '@angular/core'
import {Maybe} from '../../common/model/Maybe'

@Injectable({
	providedIn: 'root'
})
export class MatcherService {

	constructor() {
	}

	match<K, V>(key: K, cases: Map<K, V>): Maybe<V> {
		return new Maybe(cases.get(key))
	}

}
