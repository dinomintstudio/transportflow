import {Position} from "./Position";

export const lerp = (start: number, end: number, k: number): number => start + (end - start) * k;

export const lerpPosition = (start: Position, end: Position, k: number): Position =>
	start.add(
		end
			.sub(start)
			.map(c => c * k)
	);
