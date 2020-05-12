export class SchedulingConfig {

	ups: number
	shortTermK: number
	longTermK: number

	constructor(ups: number, shortTermK: number, longTermK: number) {
		this.ups = ups
		this.shortTermK = shortTermK
		this.longTermK = longTermK
	}

}