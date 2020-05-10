import {AfterViewChecked, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {Log} from "../../common/model/Log";
import {KeyService} from "../../input/service/key.service";
import {filter} from "rxjs/operators";

@Component({
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit, AfterViewChecked {

	@ViewChild('scroll', {static: true})
	scroll: ElementRef;

	@Output() onClose: EventEmitter<void>;

	logs: string[];
	input: string;

	constructor(
		private keyService: KeyService,
	) {
		this.onClose = new EventEmitter<void>();
		this.logs = [];
		this.logs.push('Welcome to console.');
		this.input = '';

		Log.content.asObservable().subscribe(log => {
			this.logs.push(log);
		});

		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === 'Escape')
			)
			.subscribe(() => {
				this.onClose.emit();
			});
	}

	ngOnInit(): void {
	}

	ngAfterViewChecked(): void {
		this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
	}

}
