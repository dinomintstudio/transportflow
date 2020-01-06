import {Road} from "./Road";
import {Maybe} from "../../common/model/Maybe";

export class RoadTile {

	tunnel: Maybe<Road>;
	surface: Maybe<Road>;
	bridge: Maybe<Road>;

	constructor(tunnel: Maybe<Road>, surface: Maybe<Road>, bridge: Maybe<Road>) {
		this.tunnel = tunnel;
		this.surface = surface;
		this.bridge = bridge;
	}

}