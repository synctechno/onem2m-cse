import {resourceTypeEnum as ty, resultData, rscEnum as rsc, supportedReleaseVersions} from "../../types/types.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {CseBase} from "./cseBase.entity.js";
import {AeManager} from "../ae/ae.manager.js";
import {cseConfig, defaulAeConfig, defaultAcpConfig} from "../../configs/cse.config.js";
import {AccessControlPolicyManager} from "../accessControlPolicy/accessControlPolicy.manager.js";
import {getEnumValues} from "../../utils.js";

const SRV: supportedReleaseVersions = ["3"];
const POA = ["http://127.0.0.1:3000"];
const CSE_RESOURCE_ID = "in-cse-id";
const SRT: ty[] = getEnumValues(ty).slice(1) as ty[]; //slice(1) to remove mixed
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
        this.rn = cseConfig.cseName;
        this.csi = cseConfig.cseId;

        this.aeManager = new AeManager();
        this.acpManager = new AccessControlPolicyManager();

        try {
            this.init(this.ri, this.rn, this.csi, this.pi, this.srv, this.poa, this.srt)
        } catch (e) {
            console.log("Initialization error: ", e);
        }
    }

    protected async create(pc, targetResource, originator: string): Promise<resultData> {
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
                ri: "", pi: "", structured: "", ty: ty.CSEBase, originator: ""
            },
            csi
        );

        await this.aeManager.create(
            {
                'm2m:ae': {
                    ri: defaulAeConfig.ri,
                    rn: defaulAeConfig.rn,
                    pi: ri,
                    ty: ty.AE,
                    api: defaulAeConfig.api,
                    rr: true
                }
            },
            {ri: ri, pi: "", structured: rn, ty: ty.CSEBase, originator: ""},
            defaulAeConfig.aei)
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
            {ri: ri, pi: "", structured: rn, ty: ty.CSEBase},
            defaulAeConfig.aei)
    }
}
