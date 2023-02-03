import {Container} from "./container.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";

export class ContainerManager extends BaseManager<Container>{
    constructor() {
        super(Container);
    }
}
