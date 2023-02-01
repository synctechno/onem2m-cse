import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc, rscEnum} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {ContainerRepository} from "./container.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";

export class ContainerManager {
    private containerRepository;
    private lookupRepository;

    constructor() {
        this.containerRepository = new ContainerRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData>{
        switch (op) {
            case operationEnum.CREATE:{
                const resource: any = pc["m2m:cnt"];
                resource.pi = targetResource.ri;

                const ri = nanoid(8);
                resource.ri = ri;

                const data = await this.containerRepository.save(resource);
                await this.lookupRepository.save({
                    ri: ri,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + pc["m2m:cnt"].rn,
                    ty: resourceTypeEnum.container })

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:cnt": data}
                }
            }
            case operationEnum.RETRIEVE:{
                const resource = await this.containerRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:acp": resource}
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    getResource(ri){
        return this.containerRepository.findOneBy({ri});
    }
}
