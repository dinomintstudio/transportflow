import {Position} from '../../../common/model/Position'
import {Range} from '../../../common/model/Range'

/**
 * Configuration of street generation
 */
// TODO: convert all dynamic configs to interfaces
export class StreetGenerationConfig {
	/**
	 * Length of the branch road
	 */
	roadLength: Range

	/**
	 * Describes how deep generator create branches
	 */
	propagationSteps: Range

	/**
	 * Distance between parallel roads if they are adjacent
	 */
	distanceBetweenParallelRoads: number

	/**
	 * Describes the amount of roads to be branches to current road
	 */
	branchRoadsCount: Range

	/**
	 * Describes on what amount of radians branch road can be rotated from perpendicular
	 */
	angularDeviation: Range

	/**
	 * If true the main road will have angle 0, otherwise random from 0 to 2PI
	 */
	mainRoadHorizontal: Boolean

	/**
	 * Center of the main road relative to canvas
	 */
	mainRoadCenterPosition: Position

	/**
	 * Value between 0 and 0.5 specifying how close branch road end should be to 'stick' with value
	 */
	roadEdgeStickiness: number

	/**
	 * Amount of roads in total
	 */
	totalRoadCount: Range

	/**
	 * Constructs config
	 * @param roadLength
	 * @param propagationSteps
	 * @param distanceBetweenParallelRoads
	 * @param angularDeviation
	 * @param branchRoadsCount
	 * @param mainRoadHorizontal
	 * @param mainRoadCenterPosition
	 * @param roadEdgeStickiness
	 * @param totalRoadCount
	 */
	constructor(roadLength: Range, propagationSteps: Range, distanceBetweenParallelRoads: number, branchRoadsCount: Range, angularDeviation: Range = new Range(0, 0), mainRoadHorizontal: Boolean = true, mainRoadCenterPosition: Position = Position.ZERO, roadEdgeStickiness: number = 0, totalRoadCount: Range = null) {
		this.roadLength = roadLength
		this.propagationSteps = propagationSteps
		this.distanceBetweenParallelRoads = distanceBetweenParallelRoads
		this.angularDeviation = angularDeviation
		this.branchRoadsCount = branchRoadsCount
		this.mainRoadHorizontal = mainRoadHorizontal
		this.mainRoadCenterPosition = mainRoadCenterPosition
		this.roadEdgeStickiness = roadEdgeStickiness
		this.totalRoadCount = totalRoadCount
	}
}
