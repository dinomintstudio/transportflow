import {Range} from "../../common/model/Range";

export class CameraConfig {

	zoomLimit: Range;
	minimapTriggerZoom: number;

	constructor(zoomLimit: Range = new Range(0, Infinity), minimapTriggerZoom: number = 16) {
		this.zoomLimit = zoomLimit;
		this.minimapTriggerZoom = minimapTriggerZoom;
	}

}
