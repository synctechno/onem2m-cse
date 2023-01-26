import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {SubscriptionRepository} from "./subscription.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {Subscription} from "./subscription.entity.js";
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

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:sub"];
            resource.pi = targetResource.ri;

            const ri = nanoid(8);
            resource.ri = ri;

            const data = await this.subscriptionRepository.save(resource);
            await this.lookupRepository.save({
                ri: ri,
                path: targetResource.path + '/' + primitive["m2m:rqp"].pc["m2m:sub"].rn,
                ty: resourceTypeEnum.subscription })

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: data
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            const resource = await this.subscriptionRepository.findOneBy({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: resource
                }
            }
        } else {
            return {
                "m2m:rsp":{
                    rsc: 5000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: undefined
                }
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
