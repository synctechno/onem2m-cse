import {DataSource, Repository} from "typeorm";
import {Lookup} from "./lookup.entity.js";

export class LookupRepository extends Repository<Lookup>{
    constructor(dataSource: DataSource) {
        super(Lookup, dataSource.createEntityManager());
    }
}
