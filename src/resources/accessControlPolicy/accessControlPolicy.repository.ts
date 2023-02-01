import {AccessControlPolicy} from "./accessControlPolicy.entity.js";
import {DataSource, Repository} from "typeorm";


export class AccessControlPolicyRepository extends Repository<AccessControlPolicy>{
    constructor(dataSource: DataSource) {
        super(AccessControlPolicy, dataSource.createEntityManager());
    }
}
