import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {FlexContainerRepository} from "./flexContainer.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {TypeCompiler} from '@sinclair/typebox/compiler'
import {containerDefinitions, sdtSchemaCreate, sdtSchemaUpdate} from "../../types/sdt.js";

const sdtCreateValidator = TypeCompiler.Compile(sdtSchemaCreate);
const sdtUpdateValidator = TypeCompiler.Compile(sdtSchemaUpdate);



export class FlexContainerManager {
    private flexContainerRepository;
    private lookupRepository;

    constructor() {
        this.flexContainerRepository = new FlexContainerRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData> {
        switch (op){
            case operationEnum.CREATE: {
                const prefix = Object.keys(pc)[0];
                //validations
                if (!containerDefinitions.includes(pc[prefix].cnd)){
                    return rscEnum.SPECIALIZATION_SCHEMA_NOT_FOUND;
                }
                if (!sdtCreateValidator.Check(pc)){
                    return rsc.BAD_REQUEST;
                }

                const {rn, cnd, ...ca} = pc[prefix];
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
                    structured: targetResource.structured + '/' + pc[prefix].rn,
                    ty: resourceTypeEnum.flexContainer
                })

                return {
                    rsc: rsc.CREATED,
                    pc: {...rest, ...caFromDb}
                }
            }
            case operationEnum.RETRIEVE: {
                const {ca: caFromDb, ...rest} = await this.flexContainerRepository.findOneBy({ri: targetResource.ri});
                if (!rest){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:fcnt": {...rest, ...caFromDb}} //TODO fix prefix to the right specialization prefix, e.g. add prefix column to database
                }
            }
            case operationEnum.UPDATE: {
                const prefix = Object.keys(pc)[0];
                //validations
                if (!containerDefinitions.includes(pc[prefix].cnd)){
                    return rscEnum.SPECIALIZATION_SCHEMA_NOT_FOUND;
                }
                if (!sdtCreateValidator.Check(pc)){
                    return rsc.BAD_REQUEST;
                }
                const {rn, cnd, ...ca} = pc[prefix];

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
                    rsc: rsc.UPDATED,
                    pc: {"m2m:fcnt": {...savedRest, ...savedCa}} //TODO fix prefix to the right specialization prefix, e.g. add prefix column to database
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }
    async getResource(ri){
        const {ca: caFromDb, ...rest} =  this.flexContainerRepository.findOneBy({ri});
        return {...rest, ...caFromDb}
    }
}
