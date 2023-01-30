import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {FlexContainerRepository} from "./flexContainer.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {sdtSchemaCreate, sdtSchemaUpdate} from "../../types/sdt.js";

const sdtCreateValidator = TypeCompiler.Compile(sdtSchemaCreate);
const sdtUpdateValidator = TypeCompiler.Compile(sdtSchemaUpdate);



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
                const prefix = Object.keys(primitive["m2m:rqp"]["pc"])[0];
                //validate as per SDT schema if prefix is not m2m:fcnt
                if (prefix !== "m2m:fcnt") {
                    if (!sdtCreateValidator.Check(primitive["m2m:rqp"]["pc"])){
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
                const {rn, cnd, ...ca} = primitive["m2m:rqp"]["pc"][prefix];
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
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + primitive["m2m:rqp"].pc[prefix].rn,
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
                        pc: {"m2m:fcnt": {...rest, ...caFromDb}}
                    }
                }
            }
            case operationEnum.UPDATE: {
                const prefix = Object.keys(primitive["m2m:rqp"]["pc"])[0];
                //validate as per SDT schema if prefix is not m2m:fcnt
                if (prefix !== "m2m:fcnt") {
                    if (!sdtUpdateValidator.Check(primitive["m2m:rqp"]["pc"])){
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
                const {rn, cnd, ...ca} = primitive["m2m:rqp"]["pc"][prefix];

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
                        pc: {"m2m:fcnt": {...savedRest, ...savedCa}}
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
    async getResource(ri){
        const {ca: caFromDb, ...rest} =  this.flexContainerRepository.findOneBy({ri});
        return {...rest, ...caFromDb}
    }
}
