import {FlexContainer} from "./flexContainer.entity.js";
import {DataSource, Repository} from "typeorm";


export class FlexContainerRepository extends Repository<FlexContainer>{
    constructor(dataSource: DataSource) {
        super(FlexContainer, dataSource.createEntityManager());
    }
    retrieveByResourceId(ri): Promise<FlexContainer | null>
    {
        return this.findOneBy({ri});
    }
}
