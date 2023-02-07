import {BaseManager} from "../baseResource/base.manager.js";
import {Subscription} from "./subscription.entity.js";
import {rscEnum as rsc} from "../../types/types.js";

export class SubscriptionManager extends BaseManager<Subscription>{
    constructor() {
        super(Subscription);
    }
    async getResourceSubscriptions(pi){
        const data = await this.repository.findBy({pi});
        if(!data){
            return rsc.NOT_FOUND;
        }
        return data;
    }
}
