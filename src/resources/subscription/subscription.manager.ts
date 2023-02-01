import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {SubscriptionRepository} from "./subscription.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

export class SubscriptionManager {
    private subscriptionRepository;
    private lookupRepository;

    constructor() {
        this.subscriptionRepository = new SubscriptionRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData>{
        switch (op) {
            case operationEnum.CREATE:{
                const resource: any = pc["m2m:sub"];
                resource.pi = targetResource.ri;

                const ri = nanoid(8);
                resource.ri = ri;

                const data = await this.subscriptionRepository.save(resource);
                await this.lookupRepository.save({
                    ri: ri,
                    structured: targetResource.structured + '/' + pc["m2m:sub"].rn,
                    ty: resourceTypeEnum.subscription })

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:sub": data}
                }
            }
            case operationEnum.RETRIEVE:{
                const resource = await this.subscriptionRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:sub": resource}
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }
    getResourceSubscriptions(pi){
        return this.subscriptionRepository.findBy({pi});
    }

    getResource(ri){
        return this.subscriptionRepository.findOneBy({ri});
    }
}
