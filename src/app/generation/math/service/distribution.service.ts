import {Injectable} from '@angular/core';
import {Rectangle} from "../../../common/model/Rectangle";
import {Shape} from "../../../common/model/Shape";
import {RandomService} from "../../../random/service/random.service";

import _ from 'lodash'
import {Position} from "../../../common/model/Position";
import {Range} from "../../../common/model/Range";

@Injectable({
	providedIn: 'root'
})
export class DistributionService {

	constructor(
		private randomService: RandomService
	) {
	}

	distribute(rectangle: Rectangle, density: number): Position[] {
		const gridShape = this.estimateGridShape(rectangle, density);
		const sizeLength = rectangle.shape.width / gridShape.width;

		const points: Position[] = [];

		_.range(gridShape.width).forEach(j => {
			_.range(gridShape.height).forEach(i => {
				points.push(
					new Position(
						j * sizeLength +
						this.randomService.randomRangeInteger(new Range(0, sizeLength)),
						i * sizeLength +
						this.randomService.randomRangeInteger(new Range(0, sizeLength)),
					)
				)
			});
		});

		return points;
	}

	estimateGridShape(rectangle: Rectangle, density: number): Shape {
		const n = rectangle.area() * density;

		const squareGridSize = Math.round(Math.sqrt(n));
		return new Shape(squareGridSize, squareGridSize);
	}

}
