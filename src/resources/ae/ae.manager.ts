import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {AeRepository} from "./ae.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";

export class AeManager{
    private aeRepository;
    private lookupRepository;

    constructor() {
        this.aeRepository = new AeRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?, options?: {fr?: string}): Promise<resultData>{
        switch (op) {
            case operationEnum.CREATE:{
                if (options?.fr!.charAt(0) !== 'C' && options?.fr!.charAt(0) !== 'S'){ //TODO clarify the usage of 'C' and 'S'
                    return rscEnum.BAD_REQUEST;
                }

                if (!['N', 'R'].includes(pc.aei.charAt(0))){ //TODO clarify the usage of 'N', 'R', and 'r'?
                    return rscEnum.BAD_REQUEST;
                }
                let resourceId = "";
                if (options?.fr! === 'S'){
                    resourceId = 'S' + nanoid(8)
                } else if (options?.fr!.charAt(0) === 'C'){
                    resourceId = options?.fr!;
                }

                const resource: any = pc["m2m:ae"];
                resource.pi = targetResource.ri;
                resource.ri = resourceId;
                resource.aei = options?.fr!;

                const data = await this.aeRepository.save(resource);
                await this.lookupRepository.save({
                    ri: resourceId,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' +pc["m2m:ae"].rn,
                    ty: resourceTypeEnum.AE })

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:ae": data}
                }
            }
            case operationEnum.RETRIEVE:{
                const resource = await this.aeRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:ae": resource}
                }
            }
            case operationEnum.DELETE:{
                await this.aeRepository.deleteOne({ri: targetResource.ri});
                await this.lookupRepository.deleteOne({ri: targetResource.ri});
                return rsc.DELETED;
            }
            default:{
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    getResource(ri){
        return this.aeRepository.findOneBy({ri});
    }
}
