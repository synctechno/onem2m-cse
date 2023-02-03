import {resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {BaseRepository} from "./base.repository.js";
import {Resource} from "./base.entity.js";
import {resourceTypeToPrefix} from "../../utils.js";

export abstract class BaseManager<T extends Resource> {
    private readonly repository: BaseRepository<T>;
    private readonly entityType;
    private readonly prefix;

    protected constructor(entityType: {new(): T}) {
        this.repository = new BaseRepository(entityType);
        this.entityType = entityType;
        this.prefix = resourceTypeToPrefix.get(this.entityType.getTy()) ;
    }

    async handleRequest(op: operationEnum, pc, targetResource): Promise<resultData> {
        switch (op) {
            case operationEnum.CREATE: {
                return this.create(pc, targetResource);
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

    protected async create(pc, targetResource){
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

    protected async retrieve(targetResource){
        const data = await this.repository.findOne(targetResource.ri)
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

    protected async update(pc, targetResource){
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

    protected async delete(targetResource){
        const data = await this.repository.delete(targetResource.ri)
        if (!data) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return rsc.DELETED;
    }

    getResource(ri) {
        return this.repository.findOne(ri);
    }
}
