import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
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

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:cnt"];
            resource.pi = targetResource.ri;

            const ri = nanoid(8);
            resource.ri = ri;

            const data = await this.containerRepository.save(resource);
            await this.lookupRepository.save({
                ri: ri,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + primitive["m2m:rqp"].pc["m2m:cnt"].rn,
                ty: resourceTypeEnum.container })

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: {"m2m:cnt": data}
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            const resource = await this.containerRepository.findOneBy({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: {"m2m:cnt": resource}
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
        return this.containerRepository.findOneBy({ri});
    }
}
