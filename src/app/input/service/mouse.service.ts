import {Injectable} from '@angular/core'
import {ObservableData} from '../../common/model/ObservableData'

@Injectable({
	providedIn: 'root'
})
export class MouseService {

	mouseClick: ObservableData<MouseEvent>
	mouseMove: ObservableData<MouseEvent>

	mouseDown: ObservableData<MouseEvent>
	mouseUp: ObservableData<MouseEvent>

	mouseDrag: ObservableData<MouseEvent>

	mouseWheel: ObservableData<WheelEvent>
	zoomIn: ObservableData<void>
	zoomOut: ObservableData<void>

	private isDown = false

	constructor() {
		this.mouseClick = new ObservableData<MouseEvent>()
		this.mouseMove = new ObservableData<MouseEvent>()

		this.mouseDown = new ObservableData<MouseEvent>()
		this.mouseUp = new ObservableData<MouseEvent>()
		this.mouseDrag = new ObservableData<MouseEvent>()
		this.mouseDown.observable.subscribe(e => {
			this.isDown = true
		})
		this.mouseUp.observable.subscribe(e => {
			this.isDown = false
		})
		this.mouseMove.observable.subscribe(e => {
			if (this.isDown) {
				this.mouseDrag.set(e)
			}
		})

		this.mouseWheel = new ObservableData<WheelEvent>()
		this.zoomIn = new ObservableData<void>()
		this.zoomOut = new ObservableData<void>()
		this.mouseWheel.observable.subscribe(e => {
			if (e.deltaY < 0) {
				this.zoomIn.set()
			} else {
				this.zoomOut.set()
			}
		})
	}

}
