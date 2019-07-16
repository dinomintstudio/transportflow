import {Injectable} from '@angular/core';
import {ObservableData} from "../../common/model/ObservableData";
import {first} from 'rxjs/operators';
import * as config from '../config/scheduling.config.json'

/**
 * Responsible for generation in game updates (ticks)
 */
@Injectable({
	providedIn: 'root'
})
export class ClockService {

	/**
	 * Observable data of the last tick emitted
	 */
	tick: ObservableData<number>;

	/**
	 * Is clock now counting
	 */
	private counting: Boolean = false;

	/**
	 * Id of `setInterval()` handler;
	 */
	private intervalId: number;

	/**
	 * Construct service
	 */
	constructor() {
		this.tick = new ObservableData<number>(null);
		this.intervalId = setInterval(() => this.loop(), 1000 / config.ups);
	}

	/**
	 * After call `tick` begin to emit from the last tick
	 */
	start() {
		this.counting = true;
	}

	/**
	 * Stop tick emitting. Called when the game is in the 'pause' mode
	 */
	stop() {
		this.counting = false;
	}

	/**
	 * Loop that used for tick emitting
	 */
	private loop() {
		if (!this.counting) return;
		this.tick.observable.pipe(first()).subscribe(tick => {
			this.tick.set(tick + 1);
		});
	}

}
