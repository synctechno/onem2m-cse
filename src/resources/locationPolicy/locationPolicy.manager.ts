import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {LocationPolicyRepository} from "./locationPolicy.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {ContainerRepository} from "../container/container.repository.js";

export class LocationPolicyManager {
    private locationPolicyRepository;
    private containerRepository;
    private lookupRepository;

    constructor() {
        this.locationPolicyRepository = new LocationPolicyRepository(dataSource);
        this.containerRepository = new ContainerRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:lcp"];
            resource.pi = targetResource.ri;

            const ri = nanoid(8);
            resource.ri = ri;
            resource.lost = "normal"

            const containerRi = nanoid(8);
            resource.loi = containerRi;

            const containerName = resource.lon ? resource.lon: 'lcp_' + nanoid(8)

            const containerResource = {
                ri: containerRi,
                rn: containerName,
                pi: resource.pi,
                li: ri
            }

            await this.lookupRepository.save({
                ri: containerRi,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + containerName,
                ty: resourceTypeEnum.container})

            await this.containerRepository.save(containerResource);
            const data = await this.locationPolicyRepository.save(resource);
            await this.lookupRepository.save({
                ri: ri,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + primitive["m2m:rqp"].pc["m2m:lcp"].rn,
                ty: resourceTypeEnum.locationPolicy })

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: {"m2m:lcp": data}
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            const resource = await this.locationPolicyRepository.findOneBy({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: {"m2m:lcp": resource}
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
    getResource(ri){
        return this.locationPolicyRepository.findOneBy({ri});
    }
}
