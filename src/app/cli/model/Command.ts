export class Command {

	serviceName: string
	methodName: string
	args: any[]

	constructor(serviceName: string, methodName: string, ...args: any[]) {
		this.serviceName = serviceName
		this.methodName = methodName
		this.args = args
	}

	toString(): string {
		return `${this.serviceName}.${this.methodName}(${this.args.map(a => a.toString()).join(', ')})`
	}

}
