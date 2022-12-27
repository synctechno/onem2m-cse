import {AE} from "./ae.entity.js";
import {DataSource, Repository} from "typeorm";


export class AeRepository extends Repository<AE>{
    constructor(dataSource: DataSource) {
        super(AE, dataSource.createEntityManager());
    }
    retrieveByResourceId(ri): Promise<AE | null>
    {
        return this.findOneBy({ri});
    }
}
