import {StreetGeneratorConfig} from "./StreetGeneratorConfig";
import {Position} from "../../common/model/Position";
import {Range} from "../../common/model/Range";
import {Injectable} from "@angular/core";
import {RandomService} from "../../random/service/random.service";

// TODO: docs
@Injectable({
	providedIn: 'root'
})
export class Road {
	public center: Position;
	public centerOffset: number;
	public angle: number;
	public length: number;

	public config: StreetGeneratorConfig;

	public startPoint: Position;
	public endPoint: Position;

	constructor(
		private randomService: RandomService,
		center, centerOffset, angle, length, config: StreetGeneratorConfig
	) {
		this.center = center;
		this.centerOffset = parseFloat(centerOffset);
		this.angle = parseFloat(angle);
		this.length = length;

		this.config = config;

		this.startPoint = this.startPointPosition();
		this.endPoint = this.endPointPosition();
	}

	private startPointPosition(): Position {
		const x = this.center.x + (this.centerOffset * -this.length * Math.cos(this.angle));
		const y = this.center.y + (this.centerOffset * -this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	private endPointPosition(): Position {
		const x = this.center.x + ((1 - this.centerOffset) * this.length * Math.cos(this.angle));
		const y = this.center.y + ((1 - this.centerOffset) * this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	generateIntersecting(propagationSteps: number, roads: Road[] = []): Road[] {
		let offset: number = this.randomService.random();
		if (offset < 0.1) offset = 0;
		if (offset > 0.9) offset = 1;

		let road: Road = new Road(
			this.randomService,
			this.randomPointOnRoad(),
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

		if (road.isCloseToParallel(roads)) {
			road = null;
		} else {
			roads.push(road);
		}

		if (road && propagationSteps > 0) {
			return road.generateIntersecting(propagationSteps - 1, roads);
		} else {
			return roads;
		}
	}

	private randomPointOnRoad(): Position {
		const startPoint = this.startPointPosition();

		let offset = this.randomService.random();
		if (offset < this.config.roadEdgeStickiness) offset = 0;
		if (offset > 1 - this.config.roadEdgeStickiness) offset = 1;

		let x = startPoint.x + (offset * this.length * Math.cos(this.angle));
		let y = startPoint.y + (offset * this.length * Math.sin(this.angle));

		return new Position(x, y);
	}

	// TODO: refactor
	/**
	 * Works only for such config where `angularDeviation` is set to 0
	 * @returns {Boolean}
	 */
	isCloseToParallel(roads: Road[]): Boolean {
		if (this.randomService.randomRange(this.config.angularDeviation) !== 0) throw new Error('illegal config');

		const rangeX: Range = new Range(this.startPointPosition().x, this.endPointPosition().x);
		const rangeY: Range = new Range(this.startPointPosition().y, this.endPointPosition().y);

		for (let r of roads) {
			if (Road.isParallel(r, this)) {
				if (Road.isHorizontal(r)) {
					const range = new Range(r.startPointPosition().x, r.endPointPosition().x);
					// if adjacent
					if (range.in(this.startPointPosition().x) || range.in(this.endPointPosition().x) ||
						rangeX.in(r.startPointPosition().x) || rangeX.in(r.endPointPosition().x)) {
						// if too close to each other
						if (Math.abs(r.startPointPosition().y - this.startPointPosition().y) < this.config.distanceBetweenParallelRoads) {
							return true;
						}
					}
				} else {
					const range = new Range(r.startPointPosition().y, r.endPointPosition().y);
					// if adjacent
					if (range.in(this.startPointPosition().y) || range.in(this.endPointPosition().y) ||
						rangeY.in(r.startPointPosition().y) || rangeX.in(r.endPointPosition().y)) {
						// if too close to each other
						if (Math.abs(r.startPointPosition().x - this.startPointPosition().x) < this.config.distanceBetweenParallelRoads) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	private static isParallel(r1: Road, r2: Road): Boolean {
		return (r1.angle % Math.PI === r2.angle % Math.PI)
	}

	private static isHorizontal(r: Road): Boolean {
		return r.startPointPosition().y === r.endPointPosition().y
	}
}