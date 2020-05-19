import {Injectable} from '@angular/core'
import {RandomService} from './random.service'
import {NoiseConfig} from '../config/NoiseConfig'
import {Position} from '../model/Position'
import * as SimplexNoise from 'simplex-noise'
import {Range} from '../model/Range'
import {Shape} from '../model/Shape'

/**
 * Responsible for generating simplex noise
 */
@Injectable({
	providedIn: 'root'
})
export class NoiseService {

	values: number[] = []

	/**
	 * Simplex noise library instance
	 */
	private simplexNoise: SimplexNoise

	/**
	 * Constructs service
	 */
	constructor(
		private randomService: RandomService
	) {
		this.reset()
	}

	reset(): void {
		this.randomService.seed.observable.subscribe(seed => {
			this.simplexNoise = new SimplexNoise(seed)
		})
	}

	/**
	 * Generate simplex noise
	 * @param position position
	 * @param config noise config
	 * @param mapSize
	 */
	generate(position: Position, config: NoiseConfig, mapSize = Shape.square(1024)): number {
		const rdx = (position.x / mapSize.width) * (2 * Math.PI)
		const rdy = (position.y / mapSize.height) * (2 * Math.PI)
		const a = (mapSize.width / Math.PI) * Math.sin(rdx)
		const b = (mapSize.width / Math.PI) * Math.cos(rdx)
		const c = (mapSize.height / Math.PI) * Math.sin(rdy)
		const d = (mapSize.height / Math.PI) * Math.cos(rdy)
		let noiseValue = this.simplexNoise.noise4D(
			a * config.scale,
			b * config.scale,
			c * config.scale,
			d * config.scale
		)

		// mapping it to range [0, 1]
		noiseValue = new Range(0, 1).clamp((noiseValue + 1) / 2)

		return config.range.map(noiseValue)
	}

}
