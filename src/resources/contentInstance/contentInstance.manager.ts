import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {ContainerRepository} from "../container/container.repository.js";
import {ContentInstanceRepository} from "./contentInstance.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {Container} from "../container/container.entity.js";

export class ContentInstanceManager {
    private containerRepository;
    private contentInstanceRepository
    private lookupRepository;

    constructor() {
        this.containerRepository = new ContainerRepository(dataSource);
        this.contentInstanceRepository = new ContentInstanceRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData>{
        switch (op) {
            case operationEnum.CREATE:{
                const resource: any = pc["m2m:cin"];
                resource.pi = targetResource.ri;
                resource.rn = 'cin_' + nanoid(8)

                const ri = nanoid(8);
                resource.ri = ri;
                resource.cs = getContentSize(resource.con)

                const data = await this.contentInstanceRepository.save(resource);
                await this.lookupRepository.save({
                    ri: ri,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + pc["m2m:cin"].rn,
                    ty: resourceTypeEnum.contentInstance })

                const parentContainer: Container = await this.containerRepository.findOneBy({ri: targetResource.ri})
                parentContainer.cbs += resource.cs;
                parentContainer.cni ++;
                await this.containerRepository.save(parentContainer)

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:cin": data}
                }
            }
            case operationEnum.RETRIEVE:{
                let resource;
                if (!targetResource.olla){
                    resource = await this.contentInstanceRepository.findOneBy({ri: targetResource.ri});
                } else {
                    resource = await this.contentInstanceRepository.findOne(
                        {where: {pi: targetResource.pi},
                            order: {ct: targetResource.olla == 'ol' ? 'ASC' : 'DESC'}});
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:cin": resource}
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    getResource(ri){
        return this.contentInstanceRepository.findOneBy({ri});
    }
}
