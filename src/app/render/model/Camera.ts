import {Position} from '../../common/model/Position'
import {CameraConfig} from '../config/CameraConfig'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'

export class Camera {

	position: Position
	zoom: number
	config: CameraConfig

	constructor(position: Position, zoom: number = 1, cameraConfig: CameraConfig = new CameraConfig()) {
		this.position = position
		this.zoom = zoom
		this.config = cameraConfig
	}

	getViewCameraRect(worldResolution: Shape, tileResolution: number): Rectangle {
		const viewShape = worldResolution.map(s => (s * tileResolution) / this.zoom)
		return Rectangle.rectangleByOnePoint(
			this.position.mapEach(
				x => (x * tileResolution) - (viewShape.width / 2),
				y => (y * tileResolution) - (viewShape.height / 2)
			),
			viewShape
		)
	}

}
