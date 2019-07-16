import {Injectable} from '@angular/core';
import {Shape} from "../../common/model/Shape";
import {RandomService} from "../../random/service/random.service";

import _ from 'lodash'
import {Position} from "../../common/model/Position";
import {Range} from "../../common/model/Range";

/**
 * Responsible for equal distribution of points within specified rectangle
 */
@Injectable({
	providedIn: 'root'
})
export class DistributionService {

	/**
	 * Constructs service
	 */
	constructor(
		private randomService: RandomService
	) {
	}

	/**
	 * Equally distribute points within specified rectangle
	 * @param shape shape
	 * @param density distribution density (points per grid cell, where grid is
	 * `rectangle.shape.width x rectangle.shape.height`)
	 */
	distribute(shape: Shape, density: number): Position[] {
		const gridShape = this.gridShape(shape, density);
		const sizeLength = shape.width / gridShape.width;

		const points: Position[] = [];

		_.range(gridShape.width).forEach(j => {
			_.range(gridShape.height).forEach(i => {
				points.push(
					new Position(
						Math.floor(j * sizeLength +
							this.randomService.randomRange(new Range(0, sizeLength))),
						Math.floor(i * sizeLength +
							this.randomService.randomRange(new Range(0, sizeLength))),
					)
				)
			});
		});

		return points;
	}

	/**
	 * Calculate grid shape of specified rectangle with point distribution density
	 * @param shape initial shape
	 * @param density distribution density
	 * @return `(m, n), m = n = round(sqrt(rectangle.area * density))`
	 */
	gridShape(shape: Shape, density: number): Shape {
		const n = shape.area() * density;

		const squareGridSize = Math.round(Math.sqrt(n));
		return new Shape(squareGridSize, squareGridSize);
	}

}
