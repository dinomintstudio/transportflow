import {Injectable} from '@angular/core'
import {StreetGenerationConfig} from '../config/StreetGenerationConfig'
import {Road} from '../model/Road'
import {RandomService} from '../../../common/service/random.service'
import {Range} from '../../../common/model/Range'
import {Matrix} from '../../../common/model/Matrix'
import {Position} from '../../../common/model/Position'
import {Rectangle} from '../../../common/model/Rectangle'
import {TiledRoad} from '../model/TiledRoad'
import {Shape} from '../../../common/model/Shape'

/**
 * Responsible for city street generation
 */
@Injectable({
	providedIn: 'root'
})
export class StreetGenerationService {

	/**
	 * Constructs service
	 */
	constructor(
		private randomService: RandomService,
	) {
	}

	/**
	 * Generate one city's streets
	 * @param config generation config
	 * @param center
	 * @return list of generated roads
	 */
	generate(config: StreetGenerationConfig, center: Position = config.mainRoadCenterPosition): Road[] {
		const mainRoad: Road = new Road(
			this.randomService,
			config.mainRoadCenterPosition,
			this.randomService.random(),
			config.mainRoadHorizontal
				? 0
				: this.randomService.randomRange(new Range(0, 2 * Math.PI)),
			this.randomService.randomRange(config.roadLength),
			config
		)
		let roads = mainRoad.generateBranchRoads(
			this.randomService.randomRangeInteger(config.propagationSteps),
			[mainRoad]
		)

		if (!config.totalRoadCount || config.totalRoadCount.in(roads.length)) {
			return roads
		}
		this.generate(config)
	}

	toTilemap(roads: Road[]): Matrix<Boolean> {
		const roadRectangles: Rectangle[] = roads
			.map(r => this.roadToRectangle(TiledRoad.of(r)))

		let tilemapRectangle = this.calculateTilemapRectangle(roadRectangles)

		const tilemap = new Matrix<Boolean>(
			new Shape(
				tilemapRectangle.shape.width + 1,
				tilemapRectangle.shape.height + 1
			),
			null,
			() => false
		)

		roadRectangles
			.forEach(rect => {
				return tilemap.insert(
					rect.topLeft.add(new Position(
						-tilemapRectangle.topLeft.x,
						-tilemapRectangle.topLeft.y
					)),
					new Matrix<Boolean>(
						new Shape(
							rect.shape.width + 1,
							rect.shape.height + 1
						),
						[],
						() => true
					)
				)
			})

		return tilemap
	}

	private roadToRectangle(road: TiledRoad): Rectangle {
		return Rectangle.rectangleByTwoPoints(
			road.startPoint,
			road.endPoint
		)
	}

	private calculateTilemapRectangle(roads: Rectangle[]): Rectangle {
		const left = Math.min(...roads.map(r => r.topLeft.x))
		const top = Math.min(...roads.map(r => r.topLeft.y))
		const right = Math.max(...roads.map(r => r.bottomRight.x))
		const bottom = Math.max(...roads.map(r => r.bottomRight.y))

		return Rectangle.rectangleByTwoPoints(new Position(left, top), new Position(right, bottom))
	}

}
