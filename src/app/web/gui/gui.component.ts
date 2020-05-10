import {Component, HostListener, OnInit} from '@angular/core';
import {KeyService} from "../../input/service/key.service";

@Component({
	selector: 'app-gui',
	templateUrl: './gui.component.html',
	styleUrls: ['./gui.component.scss']
})
export class GuiComponent implements OnInit {

	constructor(
		private keyService: KeyService
	) {
	}

	ngOnInit() {
	}

	@HostListener('document:keydown', ['$event'])
	onKeydown(e: KeyboardEvent) {
		this.keyService.keypress.set(e);
	}

}
