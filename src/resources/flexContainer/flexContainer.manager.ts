import {resourceTypeEnum, resultData, rscEnum, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {TypeCompiler} from '@sinclair/typebox/compiler'
import {containerDefinitions, sdtSchemaCreate, sdtSchemaUpdate} from "../../types/sdt.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {FlexContainer} from "./flexContainer.entity.js";
import {operationEnum} from "../../types/primitives.js";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";


const sdtCreateValidator = TypeCompiler.Compile(sdtSchemaCreate);
const sdtUpdateValidator = TypeCompiler.Compile(sdtSchemaUpdate);


export class FlexContainerManager extends BaseManager<FlexContainer>{
    constructor() {
        super(FlexContainer);
    }

    protected async create(pc, targetResource, options?): Promise<resultData> {
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
            cs: getContentSize(ca),
            ty: resourceTypeEnum.flexContainer
        };

        const data = await this.repository.create(resource, targetResource);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: caFromDb, ...rest} = data;

        return {
            rsc: rsc.CREATED,
            pc: {...rest, ...caFromDb}
        }
    }

    protected async retrieve(targetResource): Promise<resultData> {
        const data = await this.repository.findOneBy(targetResource.ri);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: caFromDb, ...rest} = data;
        if (!rest){
            return rsc.NOT_FOUND;
        }
        return {
            rsc: rsc.OK,
            pc: {"m2m:fcnt": {...rest, ...caFromDb}} //TODO fix prefix to the right specialization prefix, e.g. add prefix column to database
        }
    }

    protected async update(pc, targetResource): Promise<resultData> {
        const prefix = Object.keys(pc)[0];
        //validations
        if (!containerDefinitions.includes(pc[prefix].cnd)){
            return rscEnum.SPECIALIZATION_SCHEMA_NOT_FOUND;
        }
        if (!sdtUpdateValidator.Check(pc)){
            return rsc.BAD_REQUEST;
        }
        const {rn, cnd, ...ca} = pc[prefix];

        const data = await this.repository.findOneBy(targetResource.ri);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        let {ca: caFromDb, ...rest} = data;
        const updatedCa = {...caFromDb, ...ca};

        if (ca){
            data.ca = updatedCa;
            data.cs = getContentSize(updatedCa)
        }
        if (cnd) {
            data.cnd = cnd;
        }

        const updateResult = await this.repository.update(data, targetResource.ri);
        if (!updateResult){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: savedCa, ...savedRest} = updateResult;
        return {
            rsc: rsc.UPDATED,
            pc: {"m2m:fcnt": {...savedRest, ...savedCa}} //TODO fix prefix to the right specialization prefix, e.g. add prefix column to database
        }
    }

    async getResource(ri) {
        const data =  await this.repository.findOneBy(ri);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: caFromDb, ...rest} = data;
        return {...rest, ...caFromDb}
    }

    async validate(resource, op: operationEnum){
        if (!resource.hasOwnProperty(this.prefix)){
            return rsc.BAD_REQUEST;
        }
        let opString;
        switch (op){
            case operationEnum.CREATE:{
                opString = 'create';
                break;
            }
            case operationEnum.UPDATE:{
                opString = 'update';
                break;
            }
            default: {
                return rsc.BAD_REQUEST;
            }
        }
        try {
            const obj = plainToInstance<FlexContainer, Object>(FlexContainer, resource[this.prefix] as Object, { });
            Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
            if (obj.ty){
                delete obj.ty;
            }
            const validateResult = await validate(obj)
            return validateResult.length === 0;
        } catch (e){
            console.log(e);
            return rsc.INTERNAL_SERVER_ERROR;
        }
    }
}
