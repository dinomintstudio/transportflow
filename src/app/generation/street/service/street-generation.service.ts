import {Injectable} from '@angular/core';
import {StreetGenerationConfig} from "../config/StreetGenerationConfig";
import {Road} from "../model/Road";
import {RandomService} from "../../../random/service/random.service";
import {Range} from "../../../common/model/Range";
import {Matrix} from "../../../common/model/Matrix";

import _ from 'lodash'
import {Position} from "../../../common/model/Position";
import {Rectangle} from "../../../common/model/Rectangle";
import {TiledRoad} from "../model/TiledRoad";
import {Shape} from "../../../common/model/Shape";

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
	 * @return list of generated roads
	 */
	generate(config: StreetGenerationConfig): Road[] {
		const mainRoad: Road = new Road(
			this.randomService,
			config.mainRoadCenterPosition,
			this.randomService.random(),
			config.mainRoadHorizontal
				? 0
				: this.randomService.randomRange(new Range(0, 2 * Math.PI)),
			this.randomService.randomRange(config.roadLength),
			config
		);
		const roads = mainRoad.generateIntersecting(
			this.randomService.randomRange(config.propagationSteps),
			[]
		);

		if (!config.totalRoadCount || config.totalRoadCount.in(roads.length)) {
			return roads;
		}
		this.generate(config);
	}

	toTilemap(roads: Road[]): Matrix<Boolean> {
		const roadRectangles: Rectangle[] = roads
			.map(r => this.roadToRectangle(TiledRoad.of(r)));

		let tilemapRectangle = this.calculateTilemapRectangle(roadRectangles);

		const tilemap = new Matrix<Boolean>(
			new Shape(
				tilemapRectangle.shape.width + 1,
				tilemapRectangle.shape.height + 1
			),
			null,
			false
		);

		console.log('tm', tilemap.shape);

		roadRectangles
			.forEach(rect => {
				console.log('to pos:', rect.topLeft.add(new Position(
					-tilemapRectangle.topLeft.x,
					-tilemapRectangle.topLeft.y
				)));

				console.log('with shape', rect.shape);

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
						true
					)
				);
			});

		return tilemap;
	}

	private roadToRectangle(road: TiledRoad): Rectangle {
		return Rectangle.rectangleByTwoPoints(
			road.startPoint,
			road.endPoint
		);
	}

	private calculateTilemapRectangle(roads: Rectangle[]): Rectangle {
		const left = _(roads)
			.map(r => r.topLeft.x)
			.min();
		const top = _(roads)
			.map(r => r.topLeft.y)
			.min();
		const right = _(roads)
			.map(r => r.bottomRight.x)
			.max();
		const bottom = _(roads)
			.map(r => r.bottomRight.y)
			.max();

		return Rectangle.rectangleByTwoPoints(new Position(left, top), new Position(right, bottom));
	}

}
