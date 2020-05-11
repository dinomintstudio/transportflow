import * as moment from 'moment';
import {ReplaySubject} from "rxjs";

export enum Level {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR'
}

export class Log {

	private readonly callerName: string;

	static content: ReplaySubject<string> = new ReplaySubject<string>();

	constructor(caller?: any) {
		this.callerName = caller && caller.constructor && caller.constructor.name ? caller.constructor.name : '';
	}

	raw(message: string): void {
		Log.content.next(message);
	}

	debug(message: string): void {
		const formatMessage = this.formatMessage(Level.DEBUG, message);
		console.debug(formatMessage);
		Log.content.next(formatMessage);
	}

	info(message: string): void {
		const formatMessage = this.formatMessage(Level.INFO, message);
		console.info(formatMessage);
		Log.content.next(formatMessage);
	}

	warn(message: string): void {
		const formatMessage = this.formatMessage(Level.WARN, message);
		console.warn(formatMessage);
		Log.content.next(formatMessage);
	}

	error(message: string, error?: Error): void {
		const formatMessage = this.formatMessage(Level.ERROR, message);
		console.error(formatMessage, error);
		Log.content.next(formatMessage);
	}

	private formatMessage(level: Level, message: string): string {
		return `${
			moment().format('YYYY-MM-DD HH:mm:ss.SSS')
		} [${level}] ${this.padEnd(this.callerName, 30)} ${message}`;
	}

	private padEnd(s: string, length: number): string {
		const padded = s.padEnd(length);
		return s.length > length - 2
			? padded.substring(0, length - 3) + '...'
			: padded;
	}

}
