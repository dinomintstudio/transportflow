import {Directive, HostListener} from "@angular/core";
import {MouseService} from "../../input/service/mouse.service";

@Directive({
	selector: '[event-source]'
})
export class EventSourceDirective {

	constructor(
		private mouseService: MouseService
	) {
	}

	@HostListener('click', ['$event'])
	onClick(e: MouseEvent) {
		this.mouseService.mouseClick.set(e);
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(e: MouseEvent) {
		this.mouseService.mouseDown.set(e);
	}

	@HostListener('mouseup', ['$event'])
	onMouseUp(e: MouseEvent) {
		this.mouseService.mouseUp.set(e);
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(e: MouseEvent) {
		this.mouseService.mouseMove.set(e);
	}

	@HostListener('wheel', ['$event'])
	onWheel(e: WheelEvent) {
		this.mouseService.mouseWheel.set(e);
	}

}