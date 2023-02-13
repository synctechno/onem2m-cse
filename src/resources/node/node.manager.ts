import {Node} from "./node.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";

export class NodeManager extends BaseManager<Node>{
    constructor() {
        super(Node);
    }
}
