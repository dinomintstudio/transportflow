import {
	AfterViewChecked,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	OnInit,
	Output,
	ViewChild
} from '@angular/core'
import {Log} from '../../common/model/Log'
import {KeyService} from '../../input/service/key.service'
import {filter} from 'rxjs/operators'
import {ConfigService} from '../../common/service/config.service'
import {untilNewFrom} from '../../common/operator/until-new-from.operator'

@Component({
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.sass']
})
export class ConsoleComponent implements OnInit, AfterViewChecked {

	@ViewChild('scroll', {static: true})
	scroll: ElementRef

	@Output() onClose: EventEmitter<void>

	log: Log = new Log(this)

	logs: string[]
	input: string
	scrollBottom: boolean
	prefix: string

	constructor(
		private keyService: KeyService,
		private configService: ConfigService
	) {
		this.onClose = new EventEmitter<void>()
		this.logs = []
		this.logs.push('Welcome to console.')
		this.input = ''
		this.scrollBottom = true
		this.prefix = '> '

		Log.content.asObservable().subscribe(log => {
			this.logs.push(log)
		})

		this.configService.renderConfig.observable.subscribe(renderConfig => {
			this.keyService.keypress.observable
				.pipe(
					untilNewFrom(this.configService.renderConfig.observable),
					filter(e => ['Escape', renderConfig.consoleKey].includes(e.key))
				)
				.subscribe(() => {
					this.onClose.emit()
				})
		})
	}

	ngOnInit(): void {
	}

	@HostListener('document:wheel', ['$event'])
	onClick(e: WheelEvent) {
		if (e.deltaY < 0) {
			this.scrollBottom = false
		}
		const el = this.scroll.nativeElement
		if (e.deltaY > 0 && el.scrollHeight - (el.clientHeight + el.scrollTop) < 100) {
			this.scrollBottom = true
		}
	}

	ngAfterViewChecked(): void {
		if (this.scrollBottom) {
			this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight
		}
	}

	command() {
		this.log.raw(this.prefix + this.input)
		this.input = ''
	}
}
