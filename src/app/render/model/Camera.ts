import {Position} from '../../common/model/Position'
import {CameraConfig} from '../config/CameraConfig'
import {Rectangle} from '../../common/model/Rectangle'
import {Shape} from '../../common/model/Shape'

/**
 * Camera used in world render
 */
export class Camera {

	/**
	 * Camera position in world tile coordinates
	 */
	position: Position

	/**
	 * Zoom level
	 */
	zoom: number

	/**
	 * Camera configuration
	 */
	config: CameraConfig

	constructor(position: Position, zoom: number = 1, cameraConfig: CameraConfig = new CameraConfig()) {
		this.position = position
		this.zoom = zoom
		this.config = cameraConfig
	}

	/**
	 * Construct rectangle of camera view of world tiles
	 * @param worldResolution
	 * @param tileResolution
	 */
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
