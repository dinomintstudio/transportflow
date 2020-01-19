import {Range} from "../../common/model/Range";

export class CameraConfig {

	zoomLimit: Range;
	minimapTriggerZoom: number;
	zoomFactor: number;

	constructor(zoomLimit: Range = new Range(0, Infinity), minimapTriggerZoom: number = 16, zoomFactor: number = 1.2) {
		this.zoomLimit = zoomLimit;
		this.minimapTriggerZoom = minimapTriggerZoom;
		this.zoomFactor = zoomFactor;
	}

}
