import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import { first } from 'rxjs/operators';
import * as config from '../config/scheduling.config.json'

@Injectable({
	providedIn: 'root'
})
export class ClockService {

	tick: ObservableData<number>;
	private counting: Boolean = false;
	private intervalId: number;

	constructor() {
		this.tick = new ObservableData<number>(null);
		this.intervalId = setInterval(() => this.loop(), 1000 / config.ups);
	}

	start() {
		this.counting = true;
	}

	stop() {
		this.counting = false;
	}

	private loop() {
		if (!this.counting) return;
		this.tick.observable.pipe(first()).subscribe(tick => {
			this.tick.set(tick + 1);
		});
	}

}
