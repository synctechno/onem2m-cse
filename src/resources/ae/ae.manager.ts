import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
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

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            if (primitive["m2m:rqp"].fr?.charAt(0) !== 'C' && primitive["m2m:rqp"].fr?.charAt(0) !== 'S'){ //TODO clarify the usage of 'C' and 'S'
                return {
                    "m2m:rsp":{
                        rsc: 4000,
                        rqi: primitive["m2m:rqp"].ri,
                        rvi: primitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        pc: undefined
                    }
                }
            }

            if (!['N', 'R'].includes(primitive["m2m:rqp"].pc["m2m:ae"].aei.charAt(0))){ //TODO clarify the usage of 'N', 'R', and 'r'?
                return {
                    "m2m:rsp":{
                        rsc: 4000,
                        rqi: primitive["m2m:rqp"].ri,
                        rvi: primitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        pc: undefined
                    }
                }
            }
            let resourceId = "";
            if (primitive["m2m:rqp"].fr === 'S'){
                resourceId = 'S' + nanoid(8)
            } else if (primitive["m2m:rqp"].fr?.charAt(0) === 'C'){
                resourceId = primitive["m2m:rqp"].fr;
            }

            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:ae"];
            resource.pi = targetResource.ri
            resource.ri = resourceId
            resource.aei = primitive["m2m:rqp"].fr

            const data = await this.aeRepository.save(resource);
            await this.lookupRepository.save({
                ri: resourceId,
                pi: targetResource.ri,
                path: targetResource.path + '/' + primitive["m2m:rqp"].pc["m2m:ae"].rn,
                ty: resourceTypeEnum.AE })

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: {"m2m:ae": data}
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            const resource = await this.aeRepository.findOneBy({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: {"m2m:ae": resource}
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
        return this.aeRepository.findOneBy({ri});
    }
}
