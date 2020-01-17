import {StreetGenerationConfig} from "../config/StreetGenerationConfig";
import {Position} from "../../../common/model/Position";
import {Range} from "../../../common/model/Range";
import {RandomService} from "../../../random/service/random.service";

import _ from 'lodash'

/**
 * Generated road instance. Output of city street generator
 */
export class Road {

	/**
	 * Center position
	 */
	public center: Position;

	/**
	 * Center offset. Value between `[0, 1]`.
	 * If 0 - center in start point
	 * If 0.5 - center in the middle
	 * If 1 - center in end point etc.
	 */
	public centerOffset: number;

	/**
	 * Road angle
	 */
	public angle: number;

	/**
	 * Road length
	 */
	public length: number;

	/**
	 * Config by which street where generated
	 */
	public config: StreetGenerationConfig;

	/**
	 * Road start point
	 */
	public startPoint: Position;

	/**
	 * Road end point
	 */
	public endPoint: Position;

	/**
	 * Constructs new Road instance
	 * @param randomService
	 * @param center
	 * @param centerOffset
	 * @param angle
	 * @param length
	 * @param config
	 */
	constructor(
		private randomService: RandomService,
		center, centerOffset, angle, length, config: StreetGenerationConfig
	) {
		this.center = center;
		this.centerOffset = parseFloat(centerOffset);
		this.angle = parseFloat(angle);
		this.length = length;

		this.config = config;

		this.startPoint = this.startPointPosition();
		this.endPoint = this.endPointPosition();
	}

	generateBranchRoads(propagationSteps: number): Road[] {
		if (propagationSteps <= 0) return [this];

		let offset: number = this.randomService.random();
		if (offset < this.config.roadEdgeStickiness) offset = 0;
		if (offset > 1 - this.config.roadEdgeStickiness) offset = 1;

		return this.randomBranchRoadCenterPositions(
			this.randomService.randomRangeInteger(this.config.branchRoadsCount)
		)
			.map(cp => {
					return new Road(
						this.randomService,
						cp,
						offset,
						this.randomService.randomRange(
							new Range(
								this.angle + Math.PI / 2 - this.randomService.randomRange(this.config.angularDeviation),
								this.angle + Math.PI / 2 + this.randomService.randomRange(this.config.angularDeviation)
							)
						),
						this.randomService.randomRange(this.config.roadLength),
						this.config
					).generateBranchRoads(propagationSteps - 1);
				}
			)
			.flatMap(rs => rs)
			.concat([this]);
	}

	/**
	 * Get start road point
	 */
	private startPointPosition(): Position {
		const x = this.center.x + (this.centerOffset * -this.length * Math.cos(this.angle));
		const y = this.center.y + (this.centerOffset * -this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	/**
	 * Get end road point
	 */
	private endPointPosition(): Position {
		const x = this.center.x + ((1 - this.centerOffset) * this.length * Math.cos(this.angle));
		const y = this.center.y + ((1 - this.centerOffset) * this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	private randomBranchRoadCenterPositions(numberOfBranches: number): Position[] {
		return this.generateRoadPieceRanges(numberOfBranches)
			.map(r => this.randomPointOnRoadPiece(r));
	}

	private generateRoadPieceRanges(numberOfBranches: number): Range[] {
		if (numberOfBranches >= this.length / this.config.distanceBetweenParallelRoads)
			throw Error('invalid config. the amount of roads to be branches must satisfy: branchRoadsCount < roadLength.from / distanceBetweenParallelRoads');

		const diff: number = this.length / numberOfBranches;
		const gap = this.config.distanceBetweenParallelRoads / 2;

		return _.range(numberOfBranches)
			.map((i, _, a) => {
				if (i === 0) {
					return new Range(0, ((i + 1) * diff - gap) / this.length);
				}
				if (i === numberOfBranches - 1) {
					return new Range((i * diff + gap) / this.length, 1);
				}
				return new Range((i * diff + gap) / this.length, ((i + 1) * diff - gap) / this.length);
			});
	}

	/**
	 * Get random point on road piece
	 */
	private randomPointOnRoadPiece(piece: Range): Position {
		const startPoint = this.startPointPosition();

		let offset = piece.map(this.randomService.random());

		if (piece.to < this.config.roadEdgeStickiness && offset < this.config.roadEdgeStickiness) offset = 0;
		if (piece.from > this.config.roadEdgeStickiness && offset > 1 - this.config.roadEdgeStickiness) offset = 1;

		let x = startPoint.x + (offset * this.length * Math.cos(this.angle));
		let y = startPoint.y + (offset * this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

}
