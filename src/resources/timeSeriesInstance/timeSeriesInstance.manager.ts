import {resultData, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {BaseRepository} from "../baseResource/base.repository.js";
import {TimeSeries} from "../timeSeries/timeSeries.entity.js";
import {TimeSeriesInstance} from "./timeSeriesInstance.entity.js";

export class TimeSeriesInstanceManager extends BaseManager<TimeSeriesInstance>{
    private readonly timeSeriesRepository: BaseRepository<TimeSeries>;

    constructor() {
        super(TimeSeriesInstance);
        this.timeSeriesRepository = new BaseRepository<TimeSeries>(TimeSeries);
    }

    protected async create(pc: TimeSeriesInstance, targetResource, options?): Promise<resultData> {
        //check that the resource with the same dataGenerationTime does not exist
        const existingDgtResources = await this.repository.findBy(pc.dgt);
        if (existingDgtResources === false){
            return rsc.INTERNAL_SERVER_ERROR;
        } else if (existingDgtResources.length !== 0){
            return rsc.CONFLICT;
        }

        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;
        resource.rn = 'tsi_' + nanoid(8)
        resource.ri = nanoid(8);
        resource.cs = getContentSize(resource.con)

        const data = await this.repository.create(resource, targetResource);

        const parentContainer = await this.timeSeriesRepository.findOneBy(targetResource.ri);
        if (!parentContainer){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        parentContainer.cbs += resource.cs;
        parentContainer.cni ++;
        await this.timeSeriesRepository.update(parentContainer, targetResource.ri)

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

    //before deleting the tsi, parent timeSeries resource attributes, cbs and cni, need to be updated
    protected async delete(targetResource): Promise<resultData> {
        const contentInstance = await this.repository.findOneBy(targetResource.id);
        if (!contentInstance){
            return rsc.INTERNAL_SERVER_ERROR;
        }
        const parentContainer = await this.timeSeriesRepository.findOneBy(targetResource.pi);
        if (!parentContainer){
            return rsc.INTERNAL_SERVER_ERROR;
        }

        parentContainer.cbs -= contentInstance.cs;
        parentContainer.cni --;
        await this.timeSeriesRepository.update(parentContainer, targetResource.pi)

        const data = await this.repository.delete(targetResource.ri);
        if (!data) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return rsc.DELETED;
    }
}
