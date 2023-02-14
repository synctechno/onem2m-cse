import {resourceTypeEnum as ty, resultData, rscEnum as rsc, supportedReleaseVersions} from "../../types/types.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {CseBase} from "./cseBase.entity.js";
import {AeManager} from "../ae/ae.manager.js";
import {cseConfig, defaulAeConfig, defaultAcpConfig} from "../../configs/cse.config.js";
import {AccessControlPolicyManager} from "../accessControlPolicy/accessControlPolicy.manager.js";

const SRV: supportedReleaseVersions = ["3"];
const POA = ["http://127.0.0.1:3000"];
const CSE_RESOURCE_ID = "KLFHnzxa";
const SRT: ty[] = [ty.AE, ty.container, ty.contentInstance, ty.CSEBase, ty.group, ty.locationPolicy, ty.node, ty.subscription, ty.flexContainer]

export class CseBaseManager extends BaseManager<CseBase> {
    private readonly ri = CSE_RESOURCE_ID;
    private readonly rn: string;
    private readonly csi: string;
    private readonly pi = "";
    private readonly srv = SRV;
    private readonly poa = POA;
    private readonly srt = SRT;

    private readonly aeManager: AeManager;
    private readonly acpManager: AccessControlPolicyManager;

    constructor() {
        super(CseBase);
        this.rn = cseConfig.cseId;
        this.csi = cseConfig.cseId;

        this.aeManager = new AeManager();
        this.acpManager = new AccessControlPolicyManager();

        try {
            this.init(this.ri, this.rn, this.csi, this.pi, this.srv, this.poa, this.srt)
        } catch (e) {
            console.log("Initialization error: ", e);
        }
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
                ri, rn, csi, pi, srv, poa, srt, ty: ty.CSEBase,
            },
            {
                ri: "", pi: "", structured: "", ty: ty.CSEBase
            }
        );

        await this.aeManager.create(
            {
                'm2m:ae': {
                    rn: defaulAeConfig.rn,
                    pi: ri,
                    ty: ty.AE,
                    aei: defaulAeConfig.aei,
                    rr: true
                }
            },
            {ri: ri, pi: "", structured: rn, ty: ty.CSEBase},
            {fr: defaulAeConfig.ri})
        await this.acpManager.create(
            {
                'm2m:acp': {
                    ri: defaultAcpConfig.ri,
                    rn: defaultAcpConfig.rn,
                    pi: ri,
                    ty: ty.accessControlPolicy,
                    pv: defaultAcpConfig.pv,
                    pvs: defaultAcpConfig.pv
                }
            },
            {ri: ri, pi: "", structured: rn, ty: ty.CSEBase})
    }
}
