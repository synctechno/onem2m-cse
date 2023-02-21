import {resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {BaseRepository} from "./base.repository.js";
import {Resource} from "./base.entity.js";
import {resourceTypeToPrefix} from "../../utils.js";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";

export abstract class BaseManager<T extends Resource> {
    protected readonly repository: BaseRepository<T>;
    private readonly entityType;
    protected readonly prefix;

    protected constructor(entityType: {new(): T}) {
        this.repository = new BaseRepository<T>(entityType);
        this.entityType = entityType;
        this.prefix = resourceTypeToPrefix.get(new this.entityType().ty);
    }

    async handleRequest(op: operationEnum, pc, targetResource, options?): Promise<resultData> {
        switch (op) {
            case operationEnum.CREATE: {
                return this.create(pc, targetResource, options);
            }
            case operationEnum.RETRIEVE: {
                return this.retrieve(targetResource);
            }
            case operationEnum.UPDATE: {
                return this.update(pc, targetResource);
            }
            case operationEnum.DELETE: {
                return this.delete(targetResource);
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    protected async create(pc, targetResource, options?): Promise<resultData>{
        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;

        const data = await this.repository.create(resource, targetResource);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: data}
        }
    }

    protected async retrieve(targetResource): Promise<resultData>{
        const data = await this.repository.findOneBy(targetResource.ri)
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        if (!data) {
            return rsc.NOT_FOUND;
        }
        return {
            rsc: rsc.OK,
            pc: {[this.prefix]: data}
        }
    }

    protected async update(pc, targetResource): Promise<resultData>{
        const resource: any = pc[this.prefix];

        const data = await this.repository.update(resource, targetResource.ri);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.UPDATED,
            pc: {[this.prefix]: data}
        }
    }

    protected async delete(targetResource): Promise<resultData>{
        const data = await this.repository.delete(targetResource.ri)
        if (!data) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return rsc.DELETED;
    }

    getResource(ri) {
        return this.repository.findOneBy(ri);
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
            const obj = plainToInstance<T, Object>(this.entityType, resource[this.prefix] as Object, { });
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
