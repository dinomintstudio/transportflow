import {Component, ElementRef, OnInit, ViewChild} from '@angular/core'
import {RenderService} from '../../render/service/render.service'
import {KeyService} from '../../input/service/key.service'
import {filter, first} from 'rxjs/operators'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.sass']
})
export class CanvasComponent implements OnInit {

	@ViewChild('canvasContainer', {static: true}) container: ElementRef

	consoleOpen: boolean
	renderService: RenderService

	constructor(
		renderService: RenderService,
		private keyService: KeyService,
		private configService: ConfigService
	) {
		this.renderService = renderService
		this.consoleOpen = false

		this.configService.renderConfig.observable
			.pipe(first())
			.subscribe(renderConfig => {
				this.keyService.keypress.observable
					.pipe(
						untilNewFrom(this.configService.renderConfig.observable),
						filter(e => e.key === renderConfig.consoleKey)
					)
					.subscribe(() => this.consoleOpen = true)

			})
	}

	ngOnInit() {
		this.renderService.initView(
			<HTMLCanvasElement>document.getElementById('worldCanvas'),
			<HTMLCanvasElement>document.getElementById('interactionCanvas'),
			<HTMLCanvasElement>document.getElementById('debugCanvas'),
			this.container.nativeElement
		)
	}

}
