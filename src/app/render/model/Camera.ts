import {Position} from '../../common/model/Position'
import {CameraConfig} from '../config/CameraConfig'

export class Camera {

	position: Position
	zoom: number
	config: CameraConfig

	constructor(position: Position, zoom: number = 1, cameraConfig: CameraConfig = new CameraConfig()) {
		this.position = position
		this.zoom = zoom
		this.config = cameraConfig
	}

}
