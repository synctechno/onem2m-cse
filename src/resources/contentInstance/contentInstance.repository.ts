import {ContentInstance} from "./contentInstance.entity.js";
import {DataSource, Repository} from "typeorm";


export class ContentInstanceRepository extends Repository<ContentInstance>{
    constructor(dataSource: DataSource) {
        super(ContentInstance, dataSource.createEntityManager());
    }
}
