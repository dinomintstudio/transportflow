import {Position} from "../../common/model/Position";
import {Range} from "../../common/model/Range";

/**
 * Configuration of street generation
 */
export class StreetGenerationConfig {
	/**
	 * length of the branch road
	 */
	roadLength: Range;

	/**
	 * describes how deep generator create branches
	 */
	propagationSteps: Range;

	/**
	 * distance between parallel roads if they are adjacent
	 */
	distanceBetweenParallelRoads: number;

	/**
	 * describes on what amount of radians branch road can be rotated from perpendicular
	 */
	angularDeviation: Range;

	/**
	 * if true the main road will have angle 0, otherwise random from 0 to 2PI
	 */
	mainRoadHorizontal: boolean;

	/**
	 * center of the main road relative to canvas
	 */
	mainRoadCenterPosition: Position;

	/**
	 * value between 0 and 0.5 specifying how close branch road end should be to 'stick' with edge
	 */
	roadEdgeStickiness: number;

	/**
	 * amount of roads in total
	 */
	totalRoadCount: Range;

	constructor(roadLength: Range, propagationSteps: Range, distanceBetweenParallelRoads: number, angularDeviation: Range, mainRoadHorizontal: boolean = true, mainRoadCenterPosition: Position = new Position(0, 0), roadEdgeStickiness: number = 0, totalRoadCount: Range = null) {
		this.roadLength = roadLength;
		this.propagationSteps = propagationSteps;
		this.distanceBetweenParallelRoads = distanceBetweenParallelRoads;
		this.angularDeviation = angularDeviation;
		this.mainRoadHorizontal = mainRoadHorizontal;
		this.mainRoadCenterPosition = mainRoadCenterPosition;
		this.roadEdgeStickiness = roadEdgeStickiness;
		this.totalRoadCount = totalRoadCount;
	}
}