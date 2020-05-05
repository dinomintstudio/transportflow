import {Component, OnInit} from '@angular/core';
import {filter, take} from "rxjs/operators";
import * as renderConfig from "../../render/config/render.config.json";
import {KeyService} from "../../input/service/key.service";
import {Log} from "../../common/model/Log";
import {interval} from "rxjs";

@Component({
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {

	visible: boolean;
	logs: string[];
	input: string;

	constructor(
		private keyService: KeyService,
	) {
		this.visible = true;
		this.logs = [];
		this.logs.push('Welcome to console.');
		this.input = '';
	}

	ngOnInit(): void {
		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === renderConfig.consoleKey)
			)
			.subscribe(e => {
				e.preventDefault();
				this.trigger();
			});

		this.keyService.keypress.observable
			.pipe(
				filter(e => e.key === 'Escape')
			)
			.subscribe(e => {
				e.preventDefault();
				this.close();
			});

		Log.content.observable.subscribe(log => {
			this.logs.push(log);
		});

		interval(100)
			.pipe(take(60))
			.subscribe(i => {
				new Log().info('new info: ' + i);
			})
	}

	private trigger(): void {
		this.visible = !this.visible;
	}

	private close(): void {
		this.visible = false;
	}

}
