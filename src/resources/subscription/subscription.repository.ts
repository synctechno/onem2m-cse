import {Subscription} from "./subscription.entity.js";
import {DataSource, Repository} from "typeorm";

export class SubscriptionRepository extends Repository<Subscription>{
    constructor(dataSource: DataSource) {
        super(Subscription, dataSource.createEntityManager());
    }
}
