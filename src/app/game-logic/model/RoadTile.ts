import {Road} from "./Road";
import {Maybe} from "../../common/model/Maybe";

export class RoadTile {

	tunnel: Maybe<Road>;
	surface: Maybe<Road>;
	bridge: Maybe<Road>;

}