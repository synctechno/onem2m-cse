import {resultData, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {Container} from "../container/container.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {ContentInstance} from "./contentInstance.entity.js";
import {BaseRepository} from "../baseResource/base.repository.js";
import {Lookup} from "../lookup/lookup.entity.js";

export class ContentInstanceManager extends BaseManager<ContentInstance>{
    private readonly containerRepository: BaseRepository<Container>;

    constructor() {
        super(ContentInstance);
        this.containerRepository = new BaseRepository<Container>(Container);
    }

    protected async create(pc, targetResource: Lookup, originator: string): Promise<resultData> {
        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;
        resource.rn = 'cin_' + nanoid(8)
        resource.ri = nanoid(8);
        resource.cs = getContentSize(resource.con)

        const data = await this.repository.create(resource, targetResource, originator);

        const parentContainer = await this.containerRepository.findOneBy(targetResource.ri);
        if (!parentContainer){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        parentContainer.cbs += resource.cs;
        parentContainer.cni ++;
        await this.containerRepository.update(parentContainer, targetResource.ri)

        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: data}
        }
    }

    protected async retrieve(targetResource): Promise<resultData> {
        let resource;
        if (!targetResource.olla){
            resource = await this.repository.findOneBy(targetResource.ri);
        } else {
            resource = await this.repository.findOne(
                {where: {pi: targetResource.pi},
                    order: {ct: targetResource.olla == 'ol' ? 'ASC' : 'DESC'}});
        }
        return {
            rsc: rsc.OK,
            pc: {[this.prefix]: resource}
        }
    }

    protected async update(pc, targetResource): Promise<resultData> {
        return rsc.OPERATION_NOT_ALLOWED
    }

    //before deleting the cin, parent container resource attributes, cbs and cni, need to be updated
    protected async delete(targetResource): Promise<resultData> {
        const contentInstance = await this.repository.findOneBy(targetResource.id);
        if (!contentInstance){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const parentContainer = await this.containerRepository.findOneBy(targetResource.pi);
        if (!parentContainer){
            return rsc.INTERNAL_SERVER_ERROR;
        }

        parentContainer.cbs -= contentInstance.cs;
        parentContainer.cni --;
        await this.containerRepository.update(parentContainer, targetResource.pi)

        const data = await this.repository.delete(targetResource.ri);
        if (!data) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return rsc.DELETED;
    }
}
