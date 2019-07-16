import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LoggingService {

	constructor() {
	}

	info(message: string): void {
		console.info(message);
	}

	debug(message: string): void {
		console.debug(message);
	}

	warn(message: string): void {
		console.warn(message);
	}

	error(message: string): void {
		console.error(message);
	}

}
