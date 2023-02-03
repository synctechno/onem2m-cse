import {DeleteResult, EntityManager, ObjectType, UpdateResult} from "typeorm";
import {Lookup} from "../lookup/lookup.entity.js";
import {Resource} from "./base.entity.js";
import {nanoid} from "nanoid";
import dataSource from '../../database.js'

export class BaseRepository<T extends Resource> {
    readonly entityManager: EntityManager;
    readonly entityType;

    constructor(entityType: ObjectType<T>) {
        this.entityManager = dataSource.createEntityManager();
        this.entityType = entityType;
    }

    async create(resource: T, targetResource: Lookup) {
        try {
            if (!resource.ri){
                resource.ri = nanoid(8);
            }
            const data = await this.entityManager.save(this.entityType, resource);
            await this.entityManager.save(Lookup, {
                ri: resource.ri,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + resource.rn,
                ty: this.entityType.getTy()
            } as Lookup);
            return data;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async findOne(id: string) {
        try {
            return this.entityManager.findOneBy(this.entityType, {ri: id});
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async update(resource: T, id: string) {
        try {
            const updateResult: UpdateResult = await this.entityManager.update(this.entityType, id, resource);
            if (updateResult.affected !== 1){
                return false;
            }
            return this.entityManager.findOneBy(this.entityType, {ri: id});
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async delete(id: string) {
        try {
            const deleteResult: DeleteResult = await this.entityManager.delete(this.entityType, id);
            await this.entityManager.delete(Lookup, id);

            return deleteResult.affected === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
