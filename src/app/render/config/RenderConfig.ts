/**
 * Render configuration
 */
export class RenderConfig {

	/**
	 * Resolution of a map tile.
	 * Always a square
	 */
	tileResolution: number

	/**
	 * Resolution of single tile sprites.
	 * Always a square
	 */
	spriteResolution: number

	/**
	 * Resolution of a minimap tile.
	 * Always a square
	 */
	minimapResolution: number

	/**
	 * Number of tiles in a chunk side
	 * Always a square, so tiles in chunk is n^2
	 */
	chunkSize: number

	/**
	 * Radius of chunks from visible chunk to load
	 */
	chunkOverhead: number

	/**
	 * Limit view updates per second.
	 * Unlimited if null
	 */
	maxUps: number

	/**
	 * Speed of animation.
	 * Range [0, 1]
	 */
	zoomAnimationSpeed: number

	/**
	 * Limit ups for animations.
	 * Unlimited if null
	 */
	animationUps: number

	/**
	 * `key` value to be used to trigger debug overlay
	 */
	debugOverlayKey: string

	/**
	 * `key` value to be used to trigger console
	 */
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
		this.maxUps = maxFps
		this.zoomAnimationSpeed = zoomAnimationSpeed
		this.animationUps = animationUps
		this.debugOverlayKey = debugOverlayKey
		this.consoleKey = consoleKey
	}

	/**
	 * Construct config from json config file
	 * @param json
	 */
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
