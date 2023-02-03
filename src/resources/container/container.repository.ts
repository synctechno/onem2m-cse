import {Container} from "./container.entity.js";
import {DataSource, Repository} from "typeorm";

export class ContainerRepository extends Repository<Container>{
    constructor(dataSource: DataSource) {
        super(Container, dataSource.createEntityManager());
    }
}
