import {DeleteResult, EntityManager, UpdateResult} from "typeorm";
import {Lookup} from "../lookup/lookup.entity.js";
import {Resource} from "./base.entity.js";
import {nanoid} from "nanoid";
import dataSource from '../../database.js'

export class BaseRepository<T extends Resource & {ty: number}> {
    readonly entityManager: EntityManager;
    readonly entityType: {new(): T};

    constructor(entityType: {new(): T}) {
        this.entityManager = dataSource.createEntityManager();
        this.entityType = entityType;
    }

    async create(resource: T, targetResource: Lookup) {
        try {
            if (!resource.ri){
                resource.ri = nanoid(8);
            }
            const data = await this.entityManager.save(this.entityType, resource);
            const temp_obj = new this.entityType();
            await this.entityManager.save(Lookup, {
                ri: resource.ri,
                pi: targetResource.ri,
                structured: targetResource.structured ?
                    targetResource.structured + '/' + resource.rn : resource.rn,
                ty: new this.entityType().ty
            } as Lookup);
            return data;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async findOneBy(id) {
        try {
            return this.entityManager.findOneBy<T>(this.entityType, {ri: id});
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async findBy(where) {
        try {
            return this.entityManager.findBy<T>(this.entityType, where);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async findOne(options) {
        try {
            return this.entityManager.findOne<T>(this.entityType, options);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async update(resource, id) {
        try {
            const updateResult: UpdateResult = await this.entityManager.update<T>(this.entityType, id, resource);
            if (updateResult.affected !== 1){
                return false;
            }
            return this.entityManager.findOneBy<T>(this.entityType, {ri: id});
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async delete(id: string) {
        try {
            const deleteResult: DeleteResult = await this.entityManager.delete<T>(this.entityType, id);
            await this.entityManager.delete(Lookup, id);

            return deleteResult.affected === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
