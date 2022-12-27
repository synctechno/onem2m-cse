import {CseBase} from "./cseBase.entity.js";
import {DataSource, Repository} from "typeorm";


export class CseBaseRepository extends Repository<CseBase>{
    constructor(dataSource: DataSource) {
        super(CseBase, dataSource.createEntityManager());
    }
    retrieveByResourceId(ri): Promise<CseBase | null>
    {
        return this.findOneBy({ri});
    }
}
