import * as _ from 'lodash'

export const zipAdjacent = <T>(ts: T[]): [T, T][] => {
	return _.zip(_.dropRight(ts, 1), _.tail(ts))
}
