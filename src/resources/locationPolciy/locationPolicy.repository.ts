import {LocationPolicy} from "./locationPolicy.entity.js";
import {DataSource, Repository} from "typeorm";


export class LocationPolicyRepository extends Repository<LocationPolicy>{
    constructor(dataSource: DataSource) {
        super(LocationPolicy, dataSource.createEntityManager());
    }
}
