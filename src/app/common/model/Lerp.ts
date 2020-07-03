import {Position} from './Position'

/**
 * Linear interpolation function
 * @param start
 * @param end
 * @param k
 */
export const lerp = (start: number, end: number, k: number): number => start + (end - start) * k

/**
 * Linear interpolation function for position
 * @param start
 * @param end
 * @param k
 */
export const lerpPosition = (start: Position, end: Position, k: number): Position =>
	start.add(
		end
			.sub(start)
			.map(c => c * k)
	)
