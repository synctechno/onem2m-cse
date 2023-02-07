import {resourceTypeEnum as ty, resultData, rscEnum as rsc, supportedReleaseVersions} from "../../types/types.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {CseBase} from "./cseBase.entity.js";

const SRV: supportedReleaseVersions = ["3"];
const POA = ["http://127.0.0.1:3000"];
const CSE_RESOURCE_ID = "KLFHnzxa";
const SRT: ty[] = [ty.AE, ty.container, ty.contentInstance, ty.CSEBase, ty.group, ty.locationPolicy, ty.subscription, ty.flexContainer]

export class CseBaseManager extends BaseManager<CseBase> {
    private readonly ri = CSE_RESOURCE_ID;
    private readonly rn: string;
    private readonly csi: string;
    private readonly pi = "";
    private readonly srv = SRV;
    private readonly poa = POA;
    private readonly srt = SRT;

    constructor(rn: string = "", csi: string = "") {
        super(CseBase);
        this.rn = rn;
        this.csi = csi;

        //wait 0.5s to establish database connection
        setTimeout(() => {
            this.init(this.ri, this.rn, this.csi, this.pi, this.srv, this.poa, this.srt)
        }, 500);
    }

    protected async create(pc, targetResource, options?): Promise<resultData> {
        return rsc.OPERATION_NOT_ALLOWED
    }

    protected async update(pc, targetResource): Promise<resultData> {
        return rsc.OPERATION_NOT_ALLOWED
    }

    protected async delete(targetResource): Promise<resultData> {
        return rsc.OPERATION_NOT_ALLOWED
    }

    init = async (ri: string, rn: string, csi: string, pi: string, srv: supportedReleaseVersions, poa: string[], srt: ty[]) => {
        await this.repository.create({
                ri,
                rn,
                csi,
                pi,
                srv,
                poa,
                srt,
                ty: ty.CSEBase,
            },
            {
                ri: "",
                pi: "",
                structured: "",
                ty: ty.CSEBase
            }
        );
    }
}
