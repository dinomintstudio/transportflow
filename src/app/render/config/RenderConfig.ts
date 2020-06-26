export class RenderConfig {

	tileResolution: number
	spriteResolution: number
	minimapResolution: number
	chunkSize: number
	chunkOverhead: number
	maxFps: number
	zoomAnimationSpeed: number
	animationUps: number
	debugOverlayKey: string
	consoleKey: string

	constructor(
		tileResolution: number,
		spriteResolution: number,
		minimapResolution: number,
		chunkSize: number,
		chunkOverhead: number,
		maxFps: number,
		zoomAnimationSpeed: number,
		animationUps: number,
		debugOverlayKey: string,
		consoleKey: string,
	) {
		this.tileResolution = tileResolution
		this.spriteResolution = spriteResolution
		this.minimapResolution = minimapResolution
		this.chunkSize = chunkSize
		this.chunkOverhead = chunkOverhead
		this.maxFps = maxFps
		this.zoomAnimationSpeed = zoomAnimationSpeed
		this.animationUps = animationUps
		this.debugOverlayKey = debugOverlayKey
		this.consoleKey = consoleKey
	}

	static load(json: any): RenderConfig {
		return new RenderConfig(
			json.tileResolution,
			json.spriteResolution,
			json.minimapResolution,
			json.chunkSize,
			json.chunkOverhead,
			json.maxFps,
			json.zoomAnimationSpeed,
			json.animationUps,
			json.debugOverlayKey,
			json.consoleKey
		)
	}

}
