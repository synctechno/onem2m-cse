import {TimeSeries} from "./timeSeries.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";

export class TimeSeriesManager extends BaseManager<TimeSeries>{
    constructor() {
        super(TimeSeries);
    }
}
