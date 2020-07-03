import {Range} from '../../common/model/Range'

/**
 * Camera configuration
 */
export class CameraConfig {

	/**
	 * Min and max available zoom values
	 */
	zoomLimit: Range

	/**
	 * Zoom value at which map view becomes minimap view
	 */
	minimapTriggerZoom: number

	/**
	 * Zooming sensitivity
	 */
	zoomFactor: number

	constructor(zoomLimit: Range = new Range(0, Infinity), minimapTriggerZoom: number = 16, zoomFactor: number = 1.2) {
		this.zoomLimit = zoomLimit
		this.minimapTriggerZoom = minimapTriggerZoom
		this.zoomFactor = zoomFactor
	}

}
