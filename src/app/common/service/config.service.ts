import {Injectable} from '@angular/core'
import {RenderConfig} from '../../render/config/RenderConfig'
import {ObservableData} from '../model/ObservableData'
import {SpritesConfig} from '../../render/config/SpritesConfig'
import * as renderConfig from '../../render/config/render.config.json'
import * as spritesConfig from '../../render/config/sprites.config.json'

@Injectable({
	providedIn: 'root'
})
export class ConfigService {

	renderConfig: ObservableData<RenderConfig>
	spritesConfig: ObservableData<SpritesConfig>

	constructor() {
		this.renderConfig = new ObservableData<RenderConfig>(RenderConfig.load((<any>renderConfig).default))
		this.spritesConfig = new ObservableData<SpritesConfig>(SpritesConfig.load((<any>spritesConfig).default))
	}

}
