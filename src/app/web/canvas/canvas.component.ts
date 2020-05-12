import {Component, ElementRef, OnInit, ViewChild} from '@angular/core'
import {RenderService} from '../../render/service/render.service'
import {KeyService} from '../../input/service/key.service'
import {filter} from 'rxjs/operators'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

	@ViewChild('canvasContainer', {static: true}) container: ElementRef

	consoleOpen: boolean
	overlayVisible: boolean

	constructor(
		private renderService: RenderService,
		private keyService: KeyService,
		private configService: ConfigService
	) {
		this.consoleOpen = false
		this.overlayVisible = false

		this.configService.renderConfig.observable.subscribe(renderConfig => {
			this.keyService.keypress.observable
				.pipe(
					untilNewFrom(this.configService.renderConfig.observable),
					filter(e => e.key === renderConfig.consoleKey)
				)
				.subscribe(() => this.consoleOpen = true)

			this.keyService.keypress.observable
				.pipe(
					untilNewFrom(this.configService.renderConfig.observable),
					filter(e => e.key === renderConfig.debugOverlayKey)
				)
				.subscribe(() => this.overlayVisible = !this.overlayVisible)
		})
	}

	ngOnInit() {
		this.renderService.initView(
			<HTMLCanvasElement>document.getElementById('viewCanvas'),
			this.container.nativeElement
		)
	}

}
