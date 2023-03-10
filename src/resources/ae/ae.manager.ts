import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {AeRepository} from "./ae.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";

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

            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:ae"];
            resource.pi = targetResource.ri
            resource.ri = primitive["m2m:rqp"].fr
            resource.aei = primitive["m2m:rqp"].fr

            const data = await this.aeRepository.save(resource);
            await this.lookupRepository.save({
                ri: primitive["m2m:rqp"].fr,
                path: targetResource.path + '/' + primitive["m2m:rqp"].pc["m2m:ae"].rn,
                ty: resourceTypeEnum.AE })

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
            const resource = await this.aeRepository.findOneBy({ri: targetResource.ri});
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
}
