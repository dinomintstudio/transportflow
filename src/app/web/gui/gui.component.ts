import {Component, HostListener, OnInit} from '@angular/core';
import {MouseService} from "../../input/service/mouse.service";
import {KeyService} from "../../input/service/key.service";

@Component({
	selector: 'app-gui',
	templateUrl: './gui.component.html',
	styleUrls: ['./gui.component.scss']
})
export class GuiComponent implements OnInit {

	constructor(
		private mouseService: MouseService,
		private keyService: KeyService
	) {
	}

	@HostListener('document:click', ['$event'])
	onClick(e: MouseEvent) {
		this.mouseService.mouseClick.set(e);
	}

	@HostListener('document:mousedown', ['$event'])
	onMouseDown(e: MouseEvent) {
		this.mouseService.mouseDown.set(e);
	}

	@HostListener('document:mouseup', ['$event'])
	onMouseUp(e: MouseEvent) {
		this.mouseService.mouseUp.set(e);
	}

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(e: MouseEvent) {
		this.mouseService.mouseMove.set(e);
	}

	@HostListener('document:wheel', ['$event'])
	onWheel(e: WheelEvent) {
		this.mouseService.mouseWheel.set(e);
	}

	@HostListener('document:keydown', ['$event'])
	onKeydown(e: KeyboardEvent) {
		this.keyService.keypress.set(e);
	}

	ngOnInit() {
	}

}
