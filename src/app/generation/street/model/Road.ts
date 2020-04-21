import {StreetGenerationConfig} from "../config/StreetGenerationConfig";
import {Position} from "../../../common/model/Position";
import {Range} from "../../../common/model/Range";
import {RandomService} from "../../../random/service/random.service";

import * as _ from 'lodash'

/**
 * Generated road instance. Output of city street generator
 */
export class Road {

	/**
	 * Center position
	 */
	center: Position;

	/**
	 * Center offset. Value between `[0, 1]`.
	 * If 0 - center in start point
	 * If 0.5 - center in the middle
	 * If 1 - center in end point etc.
	 */
	centerOffset: number;

	/**
	 * Road angle
	 */
	angle: number;

	/**
	 * Road length
	 */
	length: number;

	/**
	 * Config by which street where generated
	 */
	config: StreetGenerationConfig;

	/**
	 * Road start point
	 */
	startPoint: Position;

	/**
	 * Road end point
	 */
	endPoint: Position;

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
		center: Position, centerOffset: number, angle: number, length: number, config: StreetGenerationConfig
	) {
		this.center = center;
		this.centerOffset = centerOffset;
		this.angle = angle;
		this.length = length;

		this.config = config;

		this.startPoint = this.startPointPosition();
		this.endPoint = this.endPointPosition();
	}

	generateBranchRoads(propagationSteps: number, roads: Road[]): Road[] {
		if (propagationSteps <= 0) return [this];

		let offset: number = this.randomService.random();
		if (offset < this.config.roadEdgeStickiness) offset = 0;
		if (offset > 1 - this.config.roadEdgeStickiness) offset = 1;

		const branchRoads: Road[] = this
			.randomBranchRoadCenterPositions(
				new Range(this.config.branchRoadsCount.from, Math.floor(this.length / this.config.distanceBetweenParallelRoads)).clamp(
					this.randomService.randomRangeInteger(this.config.branchRoadsCount)
				)
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
				);
			})
			.filter(r => !r.isOccupied(roads));

		let resultRoads: Road[] = [this];
		for (let r of branchRoads) {
			resultRoads = resultRoads.concat(
				r.generateBranchRoads(
					propagationSteps - 1,
					roads.concat(this, ...branchRoads, ...resultRoads)
				)
			);
		}

		return resultRoads;
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
		const diff: number = this.length / numberOfBranches;
		const gap = this.config.distanceBetweenParallelRoads / 2;

		return _.range(numberOfBranches)
			.map(i => new Range((i * diff + gap) / this.length, ((i + 1) * diff - gap) / this.length));
	}

	/**
	 * Get random point on road piece
	 */
	private randomPointOnRoadPiece(piece: Range): Position {
		const startPoint = this.startPointPosition();

		let offset = piece.map(this.randomService.random());

		if (offset < this.config.roadEdgeStickiness) offset = 0;
		if (offset > 1 - this.config.roadEdgeStickiness) offset = 1;

		let x = startPoint.x + (offset * this.length * Math.cos(this.angle));
		let y = startPoint.y + (offset * this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	private isOccupied(roads: Road[]): Boolean {
		return roads
			.filter(r => {
				// horizontal
				if (this.angle % Math.PI === 0 && r.angle % Math.PI === 0) {
					const ranges = [new Range(this.startPoint.y, this.endPoint.y).sort(), new Range(r.startPoint.y, this.endPoint.y).sort()];
					if (Range.areIntersect(ranges[0], ranges[1]) && Math.abs(this.startPoint.y - r.startPoint.y) <= this.config.distanceBetweenParallelRoads) {
						return true;
					}
				}
				// vertical
				else if (this.angle % Math.PI === Math.PI / 2 && r.angle % Math.PI === Math.PI / 2) {
					const ranges = [new Range(this.startPoint.x, this.endPoint.x).sort(), new Range(r.startPoint.x, this.endPoint.x).sort()];
					if (Range.areIntersect(ranges[0], ranges[1]) && Math.abs(this.startPoint.x - r.startPoint.x) <= this.config.distanceBetweenParallelRoads) {
						return true;
					}
				}
				return false;
			})
			.length !== 0;
	}

}
