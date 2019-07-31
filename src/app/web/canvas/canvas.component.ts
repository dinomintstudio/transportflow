import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RenderService} from "../../visualization/service/render.service";

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

	@ViewChild('canvasContainer', {static: true}) container: ElementRef;

	constructor(
		private renderService: RenderService
	) {
	}

	ngOnInit() {
		this.renderService.initView(
			<HTMLCanvasElement>document.getElementById('viewCanvas'),
			this.container.nativeElement
		);
	}

}
