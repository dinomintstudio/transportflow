import {Injectable} from '@angular/core'
import {Command} from '../model/Command'
import {ServiceProviderService} from './service-provider.service'
import {Log} from '../../common/model/Log'

@Injectable({
	providedIn: 'root'
})
export class CommandService {

	log: Log = new Log(this)

	constructor(
		private serviceProviderService: ServiceProviderService
	) {}

	parse(commandString: string): Command {
		const validCommandRe: RegExp = new RegExp('^\\w+\\.\\w+\\(.*\\)$')
		if (!validCommandRe.test(commandString)) throw new Error(`unable to parse command '${commandString}'`)

		const serviceNameRe: RegExp = new RegExp('^.*(?=\\.)')
		const methodNameRe: RegExp = new RegExp('(?<=\\.).*(?=\\()')
		const argsRe: RegExp = new RegExp('(?<=\\().*(?=\\))')

		const serviceName: string = serviceNameRe.exec(commandString)[0]
		const methodName: string = methodNameRe.exec(commandString)[0]
		const args: string[] = JSON.parse(
			`[${argsRe.exec(commandString)[0]}]`
		)

		const command = new Command(serviceName, methodName, args)
		this.log.debug(`parse command '${commandString}' as '${command.toString()}'`)

		return command
	}

	execute(commandString: string): any {
		const command: Command = this.parse(commandString)

		const service = this.serviceProviderService
			.get(command.serviceName)
			.orElseThrow(new Error(`no service found for name '${command.serviceName}'`))
		const method = service[command.methodName]

		if (!method) throw new Error(`service '${command.serviceName}' has no method '${command.methodName}'`)

		return method.bind(service)(...command.args)
	}

	completeServiceName(partialServiceName: string): string[] {
		return this.serviceProviderService.completeServiceName(partialServiceName)
	}

}
