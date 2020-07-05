import * as moment from 'moment'
import {ReplaySubject} from 'rxjs'

/**
 * Enum for logging levels
 */
export enum Level {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR'
}

/**
 * `console` wrapper for more detailed logs
 */
export class Log {

	/**
	 * Class that do logging.
	 * If no class were specified, name is empty
	 */
	private readonly callerName: string

	/**
	 * Replays all the content logged
	 */
	static content: ReplaySubject<string> = new ReplaySubject<string>()

	constructor(caller?: any) {
		this.callerName = caller && caller.constructor && caller.constructor.name ? caller.constructor.name : ''
	}

	/**
	 * Send content without logging into the console
	 * @param message
	 */
	raw(message: string): void {
		Log.content.next(message)
	}

	/**
	 * Send debug log
	 * @param message
	 */
	debug(message: string): void {
		const formatMessage = this.formatMessage(Level.DEBUG, message)
		console.debug(formatMessage)
		Log.content.next(formatMessage)
	}

	/**
	 * Send info log
	 * @param message
	 */
	info(message: string): void {
		const formatMessage = this.formatMessage(Level.INFO, message)
		console.info(formatMessage)
		Log.content.next(formatMessage)
	}

	/**
	 * Send warning log
	 * @param message
	 */
	warn(message: string): void {
		const formatMessage = this.formatMessage(Level.WARN, message)
		console.warn(formatMessage)
		Log.content.next(formatMessage)
	}

	/**
	 * Send error log
	 * @param message
	 * @param error
	 */
	error(message: string, error?: Error): void {
		const formatMessage = this.formatMessage(Level.ERROR, message)
		console.error(formatMessage, error)
		const formatStack = `\t${error.stack.replaceAll('\n', '\n\t')}`
		const formatMessageWithStack = `${formatMessage}: ${error.toString()}\n${formatStack}`
		Log.content.next(formatMessageWithStack)
	}

	private formatMessage(level: Level, message: string): string {
		message = (message.split('\n').length > 1 ? '\n' : '') + message
		return `${
			moment().format('YYYY-MM-DD HH:mm:ss.SSS')
		} [${level}] ${this.padEnd(this.callerName, 30)} ${message}`
	}

	private padEnd(s: string, length: number): string {
		const padded = s.padEnd(length)
		return s.length > length - 2
			? padded.substring(0, length - 3) + '...'
			: padded
	}

}
