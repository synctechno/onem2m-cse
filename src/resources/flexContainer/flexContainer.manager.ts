import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {FlexContainer, sdtPrefixMap} from "./flexContainer.entity.js";
import {operationEnum} from "../../types/primitives.js";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {Lookup} from "../lookup/lookup.entity.js";

export class FlexContainerManager extends BaseManager<FlexContainer>{
    constructor() {
        super(FlexContainer);
    }

    protected async create(pc, targetResource: Lookup, originator: string): Promise<resultData> {
        const prefix = Object.keys(pc)[0];

        const {rn, cnd, lbl, ...ca} = pc[prefix];
        const ri = nanoid(8)
        //copy without reference
        let resource = {
            pi: targetResource.ri,
            ri,
            rn,
            cnd,
            ca,
            cs: getContentSize(ca),
            lbl,
            _prefix: prefix,
            ty: resourceTypeEnum.flexContainer
        };

        const data = await this.repository.create(resource, targetResource, originator);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: caFromDb, _prefix, ...rest} = data;

        return {
            rsc: rsc.CREATED,
            pc: {[prefix]: {...rest, ...caFromDb}}
        }
    }

    protected async retrieve(targetResource): Promise<resultData> {
        const data = await this.repository.findOneBy(targetResource.ri);
        if (!data){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: caFromDb, _prefix: prefix, ...rest} = data;
        if (!rest){
            return rsc.NOT_FOUND;
        }
        return {
            rsc: rsc.OK,
            pc: {prefix: {...rest, ...caFromDb}} //TODO fix prefix to the right specialization prefix, e.g. add prefix column to database
        }
    }

    protected async update(pc, targetResource): Promise<resultData> {
        const prefix = Object.keys(pc)[0];

        const {lbl, ...ca} = pc[prefix];

        const resource = await this.repository.findOneBy(targetResource.ri);
        if (!resource){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        let {ca: caFromDb, ...rest} = resource;
        const updatedCa = {...caFromDb, ...ca};

        if (ca){
            resource.ca = updatedCa;
            resource.cs = getContentSize(updatedCa)
        }
        if (lbl) {
            resource.lbl = lbl;
        }

        const updateResult = await this.repository.update(resource, targetResource.ri);
        if (!updateResult){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const {ca: savedCa, _prefix, ...savedRest} = updateResult;
        return {
            rsc: rsc.UPDATED,
            pc: {[prefix]: {...savedRest, ...savedCa}}
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
        const sdtPrefixes = Object.getOwnPropertyNames(sdtPrefixMap);
        const resourcePrefix = Object.getOwnPropertyNames(resource)[0];
        if (!sdtPrefixes.includes(resourcePrefix)){
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
            const obj = plainToInstance(sdtPrefixMap[resourcePrefix], resource[resourcePrefix]);
            Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
            if (obj.ty){
                delete obj.ty;
            }
            const validateResult = await validate(obj, {groups: [opString], whitelist: true, forbidNonWhitelisted: true })
            return validateResult.length === 0;
        } catch (e){
            console.log(e);
            return rsc.INTERNAL_SERVER_ERROR;
        }
    }
}
