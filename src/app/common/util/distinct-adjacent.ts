import {zipAdjacent} from './zip-adjacent'
import * as _ from 'lodash'

export const distinctAdjacent = <T>(arr: T[], comparator: (e1: T, e2: T) => boolean = _.isEqual): T[] => {
	if (arr.length === 0) return []
	return zipAdjacent(arr)
		.flatMap(([e1, e2]) => comparator(e1, e2) ? [] : [e1])
		.concat(arr[arr.length - 1])
}

