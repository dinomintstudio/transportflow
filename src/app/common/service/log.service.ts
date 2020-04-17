import * as moment from 'moment';

export enum Level {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR'
}

export class Log {

	private caller: any;

	constructor(caller?: any) {
		this.caller = caller;
	}

	debug(message: string): void {
		console.debug(this.formatMessage(Level.DEBUG, message));
	}

	info(message: string): void {
		console.info(this.formatMessage(Level.INFO, message));
	}

	warn(message: string): void {
		console.warn(this.formatMessage(Level.WARN, message));
	}

	error(message: string): void {
		console.error(this.formatMessage(Level.ERROR, message));
	}

	private formatMessage(level: Level, message: string): string {
		return `${
			moment().format('YYYY-MM-DD:HH-mm-ss')
		} [${level}] ${this.padEnd(this.caller.constructor.name, 30)} ${message}`;
	}

	private padEnd(s: string, length: number): string {
		const padded = s.padEnd(length);
		return s.length > length - 2
			? padded.substring(0, length - 3) + '...'
			: padded;
	}

}
