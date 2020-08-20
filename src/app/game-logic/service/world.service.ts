import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'
import {World} from '../model/World'
import {Log} from '../../common/model/Log'
import {MonoTypeOperatorFunction} from 'rxjs'
import {Position} from '../../common/model/Position'
import {withLatestFrom} from 'rxjs/operators'
import {Matrix} from '../../common/model/Matrix'
import {Tile} from '../model/Tile'
import {Maybe} from '../../common/model/Maybe'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'

/**
 * Responsible for world initialization, generation, including terrain, natural structures, city and building placing
 * TODO: split into world and world generation services
 */
@Injectable({
	providedIn: 'root'
})
export class WorldService {

	log: Log = new Log(this)

	world: ObservableData<World> = new ObservableData<World>()

	constructor() {}

	/**
	 * Find adjacent tiles to the tile in specified position.
	 * Return 3x3 matrix
	 * @param tilemap
	 * @param position
	 */
	getAdjacentTileMatrix(tilemap: Matrix<Tile>, position: Position): Matrix<Maybe<Tile>> {
		return tilemap
			.of(Rectangle.rectangleByOnePoint(
				position.map(c => c - 1),
				Shape.square(3)
			))
			.map(t => new Maybe<Tile>(t))
	}

	/**
	 * Map unbounded world position to bounded position.
	 * For example, if world map is [32, 32] tiles and input position is [-2, 40], output will be [30, 8].
	 */
	boundPosition(): MonoTypeOperatorFunction<Position> {
		return withLatestFrom(
			this.world.observable,
			(pos, world) => pos.mapEach(
				x => x > 0
					? x % world.tilemap.shape.width
					: world.tilemap.shape.width + (x % world.tilemap.shape.width),
				y => y > 0
					? y % world.tilemap.shape.height
					: world.tilemap.shape.height + (y % world.tilemap.shape.height),
			)
		)
	}

}
