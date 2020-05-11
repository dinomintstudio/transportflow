import {Road} from './Road'
import {Position} from '../../../common/model/Position'

export class TiledRoad {

	/**
	 * Road start point
	 */
	startPoint: Position

	/**
	 * Road end point
	 */
	endPoint: Position

	constructor(startPoint: Position, endPoint: Position) {
		this.startPoint = startPoint
		this.endPoint = endPoint
	}

	static of(road: Road): TiledRoad {
		return new TiledRoad(
			new Position(
				Math.floor(road.startPoint.x),
				Math.floor(road.startPoint.y)
			),
			new Position(
				Math.floor(road.endPoint.x),
				Math.floor(road.endPoint.y),
			)
		)
	}

}