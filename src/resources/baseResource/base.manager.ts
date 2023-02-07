import {resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {BaseRepository} from "./base.repository.js";
import {Resource} from "./base.entity.js";
import {resourceTypeToPrefix} from "../../utils.js";

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
}
