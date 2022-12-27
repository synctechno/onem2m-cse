import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {FlexContainerRepository} from "./flexContainer.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";

export class FlexContainerManager {
    private flexContainerRepository;
    private lookupRepository;

    constructor() {
        this.flexContainerRepository = new FlexContainerRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive> {
        switch (primitive["m2m:rqp"].op){
            case operationEnum.CREATE: {
                const {rn, cnd, ...ca} = primitive["m2m:rqp"]["pc"]["m2m:fcnt"];
                const ri = nanoid(8)
                //copy without reference
                let resource = {
                    pi: targetResource.ri,
                    ri,
                    rn,
                    cnd,
                    ca,
                    cs: getContentSize(ca)
                };

                const {ca: caFromDb, ...rest} = await this.flexContainerRepository.save(resource);
                await this.lookupRepository.save({
                    ri,
                    path: targetResource.path + '/' + primitive["m2m:rqp"].pc["m2m:fcnt"].rn,
                    ty: resourceTypeEnum.flexContainer
                })

                return {
                    "m2m:rsp": {
                        rsc: 2001,
                        rqi: primitive["m2m:rqp"].ri,
                        rvi: primitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        ty: primitive["m2m:rqp"].ty,
                        pc: {...rest, ...caFromDb}
                    }
                }
            }
            case operationEnum.RETRIEVE: {
                const {ca: caFromDb, ...rest} = await this.flexContainerRepository.findOneBy({ri: targetResource.ri});

                return {
                    "m2m:rsp":{
                        rsc: 2000,
                        rqi: primitive["m2m:rqp"].ri,
                        rvi: primitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        ty: targetResource.ty,
                        pc: {...rest, ...caFromDb}
                    }
                }
            }
            case operationEnum.UPDATE: {
                const {rn, cnd, ...ca} = primitive["m2m:rqp"]["pc"]["m2m:fcnt"];

                let resource = await this.flexContainerRepository.findOneBy({ri: targetResource.ri});
                let {ca: caFromDb, ...rest} = resource;
                const updatedCa = {...caFromDb, ...ca};

                if (ca){
                    resource.ca = updatedCa;
                    resource.cs = getContentSize(updatedCa)
                }
                if (rn) {
                    resource.rn = rn;
                }
                if (cnd) {
                    resource.cnd = cnd;
                }

                const {ca: savedCa, ...savedRest} = await this.flexContainerRepository.save(resource);
                return {
                    "m2m:rsp":{
                        rsc: 2004,
                        rqi: primitive["m2m:rqp"].ri,
                        rvi: primitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        ty: targetResource.ty,
                        pc: {...savedRest, ...savedCa}
                    }
                }
            }
            default: {
                return {
                    "m2m:rsp": {
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
}
