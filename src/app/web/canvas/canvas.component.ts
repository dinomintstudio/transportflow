import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RenderService} from "../../render/service/render.service";
import * as renderConfig from "../../render/config/render.config.json";
import {KeyService} from "../../input/service/key.service";
import {filter, take} from "rxjs/operators";
import {interval} from "rxjs";
import {Log} from "../../common/model/Log";

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

	@ViewChild('canvasContainer', {static: true}) container: ElementRef;

	consoleOpen: boolean
	overlayVisible: boolean;

	constructor(
		private renderService: RenderService,
		private keyService: KeyService
	) {
		this.consoleOpen = false;
		this.overlayVisible = false;

		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === renderConfig.consoleKey)
			)
			.subscribe(() => this.consoleOpen = true)

		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === renderConfig.debugOverlayKey)
			)
			.subscribe(() => this.overlayVisible = !this.overlayVisible)

		interval(100)
			.pipe(take(60))
			.subscribe(i => {
				new Log().info('new info: ' + i);
			})
	}

	ngOnInit() {
		this.renderService.initView(
			<HTMLCanvasElement>document.getElementById('viewCanvas'),
			this.container.nativeElement
		);
	}

}
