import {operationEnum, requestPrimitive, requestPrimitiveData, responsePrimitive} from "./types/primitives.js";
import dataSource from "./database.js";
import {LookupRepository} from "./resources/lookup/lookup.repository.js";
import {filterCriteria, resourceTypeEnum, resourceTypeEnum as ty, resultData, rscEnum as rsc} from "./types/types.js";
import {AeManager} from "./resources/ae/ae.manager.js";
import {AccessControlPolicyManager} from "./resources/accessControlPolicy/accessControlPolicy.manager.js";
import {FlexContainerManager} from "./resources/flexContainer/flexContainer.manager.js";
import {SubscriptionManager} from "./resources/subscription/subscription.manager.js";
import {cseConfig} from "./configs/cse.config.js";
import {allowedChildResources, handleTo, resourceTypeToPrefix} from "./utils.js";
import {Lookup} from "./resources/lookup/lookup.entity.js";
import {CseBaseManager} from "./resources/cseBase/cseBase.manager.js";
import {ContainerManager} from "./resources/container/container.manager.js";
import {ContentInstanceManager} from "./resources/contentInstance/contentInstance.manager.js";
import {LocationPolicyManager} from "./resources/locationPolicy/locationPolicy.manager.js";
import {GroupManager} from "./resources/group/group.manager.js";
import {NodeManager} from "./resources/node/node.manager.js";

export class CseCore {
    private lookupRepository: LookupRepository;
    private cseBaseManager: CseBaseManager;
    private aeManager: AeManager;
    private acpManager: AccessControlPolicyManager;
    private flexContainerManager: FlexContainerManager;
    private subscriptionManager: SubscriptionManager;
    private containerManager: ContainerManager;
    private contentInstanceManager: ContentInstanceManager;
    private locationPolicyManager: LocationPolicyManager;
    private groupManager: GroupManager;
    private nodeManager: NodeManager;

    constructor() {
        this.lookupRepository = new LookupRepository(dataSource);
        this.cseBaseManager = new CseBaseManager(cseConfig.cseName, cseConfig.cseId)
        this.aeManager = new AeManager();
        this.acpManager = new AccessControlPolicyManager();
        this.flexContainerManager = new FlexContainerManager();
        this.subscriptionManager = new SubscriptionManager();
        this.containerManager = new ContainerManager();
        this.contentInstanceManager = new ContentInstanceManager();
        this.locationPolicyManager = new LocationPolicyManager();
        this.groupManager = new GroupManager();
        this.nodeManager = new NodeManager();
    }

    async primitiveGateway(requestPrimitive: requestPrimitive): Promise<responsePrimitive> {
        const primitiveData = requestPrimitive["m2m:rqp"]
        const result = await this.process(primitiveData);
        let rsc, pc;
        if (typeof result === "number") {
            rsc = result;
        } else {
            rsc = result.rsc;
            pc = result.pc;
        }
        return {
            "m2m:rsp": {
                rsc,
                rqi: primitiveData.ri,
                rvi: primitiveData.rvi,
                ot: new Date(),
                pc
            }
        }
    }


    async process(requestPrimitiveData: requestPrimitiveData): Promise<resultData> {
        //if fr is empty, response BAD_REQUEST (except for CREATE AE operation)
        if (!requestPrimitiveData.fr && !(requestPrimitiveData.op === operationEnum.CREATE && requestPrimitiveData.ty === ty.AE)) {
            return rsc.BAD_REQUEST;
        }
        //if fr is not type of AE-ID-Stem (does not start with 'C' or 'S'), response BAD_REQUEST
        if (!requestPrimitiveData.fr!.startsWith('C') && !requestPrimitiveData.fr!.startsWith('S')) {
            return rsc.BAD_REQUEST;
        }

        const to = requestPrimitiveData.to;
        const parsedTo = handleTo(to, cseConfig.cseName);
        if (parsedTo === null) {
            return rsc.NOT_FOUND;
        } else if (parsedTo.spId) {
            if (parsedTo.spId !== cseConfig.spId) {
                //TODO handle the case when M2M-SP-ID is different from the configured one, e.g. forward to another CSE
                return rsc.NOT_IMPLEMENTED
            }
        } else if (parsedTo.cseId) {
            if (parsedTo.cseId !== cseConfig.cseId) {
                //TODO handle the case when Relative CSE-ID is different from the configured one, e.g. forward to another CSE
                return rsc.NOT_IMPLEMENTED
            }
        }

        //fopt processing start
        const foptData = await this.checkFoptRequest(parsedTo);
        if (foptData.rsc) {
            return foptData.rsc;
        }
        if (foptData.fopt) {
            return await this.handleFoptRequest(requestPrimitiveData, foptData.groupLookup!)
        }
        //fopt processing end

        let targetResource;
        //check if oldest or latest
        if (parsedTo.id.split('/').at(-1) === 'ol' ||
            parsedTo.id.split('/').at(-1) === 'la') {
            const lastIndex = parsedTo.id.lastIndexOf('/');
            const oldestLatest = parsedTo.id.slice(lastIndex + 1);

            const parentResource = await this.lookupRepository.findOneBy({
                [parsedTo.structured ? 'structured' : 'ri']: parsedTo.id.slice(0, lastIndex)
            })
            if (!parentResource) {
                return rsc.NOT_FOUND;
            }
            if (parentResource.ty !== resourceTypeEnum.container) {
                return rsc.NOT_FOUND;
            }
            targetResource = {
                ty: resourceTypeEnum.contentInstance,
                pi: parentResource.ri,
                olla: oldestLatest
            }


        } else {
            targetResource = await this.lookupRepository.findOneBy(
                {[parsedTo.structured ? 'structured' : 'ri']: parsedTo.id}
            )
        }
        //targetResource baseResource does not exist
        if (!targetResource) {
            return rsc.NOT_FOUND;
        }
        if (requestPrimitiveData.op === operationEnum.CREATE) {
            //targetResource baseResource does not allow this type of child baseResource
            if (!allowedChildResources.get(targetResource.ty)?.includes(requestPrimitiveData.ty)) {
                return rsc.INVALID_CHILD_RESOURCE_TYPE;
            }

            //baseResource with the same resourceName exists
            const siblingResources = await this.lookupRepository.findBy({pi: targetResource.ri});
            for (const resource of siblingResources) {
                let rn = resource.structured.split('/').at(-1);
                const prefix = Object.keys(requestPrimitiveData['pc'])[0]
                if (requestPrimitiveData['pc'][prefix].rn === rn) {
                    return rsc.CONFLICT;
                }
            }
        }
        //check permissions if acpi exists
        if (targetResource.acpi && targetResource.ty !== resourceTypeEnum.accessControlPolicy) {
            const operationPrivileges =
                await this.acpManager.checkPrivileges(requestPrimitiveData.fr, targetResource.acpi)
            if (!operationPrivileges.get(requestPrimitiveData.op)) {
                return rsc.ORIGINATOR_HAS_NO_PRIVILEGE;
            }
        } else if (targetResource.ty === resourceTypeEnum.accessControlPolicy) {
            const operationPrivileges = await this.acpManager.checkPrivileges(requestPrimitiveData.fr, targetResource.acpi);
            if (!operationPrivileges.get(requestPrimitiveData.op)) {
                return rsc.ORIGINATOR_HAS_NO_PRIVILEGE;
            }
        }

        const targetResourceType: resourceTypeEnum = requestPrimitiveData.op === operationEnum.CREATE ?
            requestPrimitiveData.ty : targetResource.ty

        if (requestPrimitiveData.op === operationEnum.RETRIEVE && Object.keys(requestPrimitiveData.fc as Object).length !== 0) {
            const pc = await this.discoveryProcedure(requestPrimitiveData.fc!, targetResource.ri);
            if (pc) {
                return {pc, rsc: rsc.OK}
            }
        }

        let result: resultData;

        switch (targetResourceType) {
            case ty.CSEBase: {
                result = await this.cseBaseManager.handleRequest(requestPrimitiveData.op, null, targetResource);
                break;
            }
            case ty.AE: {
                result = await this.aeManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource,
                    {fr: requestPrimitiveData.fr});
                break;
            }
            case ty.accessControlPolicy: {
                result = await this.acpManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.flexContainer: {
                result = await this.flexContainerManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.subscription: {
                result = await this.subscriptionManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.container: {
                result = await this.containerManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.contentInstance: {
                result = await this.contentInstanceManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.locationPolicy: {
                result = await this.locationPolicyManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.group: {
                result = await this.groupManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            case ty.node: {
                result = await this.nodeManager.handleRequest(requestPrimitiveData.op, requestPrimitiveData.pc, targetResource);
                break;
            }
            default:
                return rsc.NOT_IMPLEMENTED;
        }

        const resultRsc = typeof result === "number" ? result : result.rsc

        if (![rsc.OK, rsc.CREATED, rsc.UPDATED, rsc.DELETED].includes(resultRsc)) {
            return result;
        }

        const subs = await this.checkSubscriptions(targetResource.ri);

        if (typeof subs === "number") {
            return subs;
        }
        //TODO need to refactor this part, add support for other notificationEventTypes
        // for (const sub of subs) {
        //     if ((sub.enc.net?.includes(notificationEventType.UPDATE) && requestPrimitiveData.op === operationEnum.UPDATE)
        //         || (sub.enc.net?.includes(notificationEventType.CREATE) && requestPrimitiveData.op === operationEnum.CREATE)) {
        //         const prefix: any = resourceTypeToPrefix.get(targetResource.ty)
        //         const pc = {
        //             "m2m:sgn": {
        //                 nev:{
        //                     rep: {
        //                         [prefix]: result.pc //TODO need to fix
        //                     },
        //                     net: sub.enc.net
        //                 },
        //                 sur: sub.ri
        //             }
        //         }
        //         for (const notificationUrl of sub.nu){
        //             request({
        //                 "m2m:rqp": {
        //                     op: operationEnum.NOTIFY,
        //                     fr: cseConfig.cseId,
        //                     to: notificationUrl,
        //                     ri: nanoid(10),
        //                     rvi: 3,
        //                     ty: targetResource.ty,
        //                     pc: pc
        //                 }
        //             })
        //         }
        //     }
        // }
        return result;
    }

    checkSubscriptions(resourceId) {
        return this.subscriptionManager.getResourceSubscriptions(resourceId);
    }

    async discoveryProcedure(fc: filterCriteria, resourceId: string) {
        fc.fu = 1; //temporary
        switch (Number(fc.fu)) {
            case 1: { //discovery
                const result: Lookup[] = await this.lookupRepository.findBy({pi: resourceId});
                switch (Number(fc?.rcn)) {
                    case 8: {
                        let pc: Object = {
                            "m2m:rrl": {
                                "m2m:rrf": []
                            }
                        };
                        for (const resourceLookup of result) {
                            let rn = resourceLookup.structured.split('/').at(-1);
                            pc["m2m:rrl"]["m2m:rrf"].push(
                                {
                                    nm: rn,
                                    typ: resourceLookup.ty,
                                    val: resourceLookup.structured
                                }
                            )
                        }
                        return pc;
                    }
                    case 4: {
                        const result: Lookup | null = await this.lookupRepository.findOneBy({ri: resourceId});
                        if (!result) {
                            return rsc.NOT_FOUND
                        }
                        // let baseResource = await this.getResource(result.ri, result.ty);
                        //
                        // const childResourcesLookup: Lookup[] =  await this.lookupRepository.findBy({pi: resourceId});
                        // for (const child of childResourcesLookup){
                        //     if(!baseResource.hasOwnProperty(resourceTypeToPrefix.get(child.ty))){
                        //         baseResource[resourceTypeToPrefix.get(child.ty)!] = []
                        //     }
                        //     baseResource[resourceTypeToPrefix.get(child.ty)!].push(
                        //         await this.getResource(child.ri, child.ty)
                        //     )
                        // }
                        // const baseResourcePrefix: string = resourceTypeToPrefix.get(baseResource.ty)!;
                        // return {
                        //     [baseResourcePrefix]: baseResource
                        // }
                        const childResourcesLookup: Lookup[] = await this.lookupRepository.findBy({pi: resourceId});
                        const discoveryResult: any = [];
                        for (const child of childResourcesLookup) {
                            const childResource = await this.getResource(child.ri, child.ty);
                            discoveryResult.push({[resourceTypeToPrefix.get(child.ty)!]: childResource})
                        }
                        return discoveryResult;
                    }
                    default: {
                        return null;
                    }
                }
            }
        }
    }

    async getResource(ri: string, ty: resourceTypeEnum) {
        switch (ty) {
            case resourceTypeEnum.CSEBase: {
                return this.cseBaseManager.getResource(ri);
            }
            case resourceTypeEnum.AE: {
                return this.aeManager.getResource(ri);
            }
            case resourceTypeEnum.accessControlPolicy: {
                return this.acpManager.getResource(ri);
            }
            case resourceTypeEnum.container: {
                return this.containerManager.getResource(ri);
            }
            case resourceTypeEnum.contentInstance: {
                return this.contentInstanceManager.getResource(ri);
            }
            case resourceTypeEnum.flexContainer: {
                return this.flexContainerManager.getResource(ri);
            }
            case resourceTypeEnum.subscription: {
                return this.subscriptionManager.getResource(ri);
            }
            case resourceTypeEnum.locationPolicy: {
                return this.locationPolicyManager.getResource(ri);
            }
            case resourceTypeEnum.group: {
                return this.groupManager.getResource(ri);
            }
            case resourceTypeEnum.node: {
                return this.nodeManager.getResource(ri);
            }
        }
    }


    async checkFoptRequest(parsedTo: {
        id: string,
        structured: boolean,
        cseId?: string,
        spId?: string
    }): Promise<{
        fopt: boolean,
        rsc?: rsc,
        groupLookup?: Lookup
    }> {
        const idParts = parsedTo.id.split('/')
        for (let i = 0; i < idParts.length; i++) {
            if (idParts[i] === 'fopt') {
                if (idParts.length === 1) {
                    return {
                        fopt: true,
                        rsc: rsc.BAD_REQUEST
                    };
                }
                //cut the parsedTo.id until fopt to get the group path
                let lookupId = parsedTo.id.split('/fopt')[0];
                const parentResource = await this.lookupRepository.findOneBy(
                    {[parsedTo.structured ? 'structured' : 'ri']: lookupId}
                )
                if (!parentResource) {
                    return {
                        fopt: true,
                        rsc: rsc.NOT_FOUND
                    }
                }
                if (parentResource.ty !== resourceTypeEnum.group) {
                    return {
                        fopt: true,
                        rsc: rsc.BAD_REQUEST
                    };
                }
                return {
                    fopt: true,
                    groupLookup: parentResource
                };
            }
        }
        return {
            fopt: false
        }
    }

    async handleFoptRequest(requestPrimitiveData: requestPrimitiveData, targetResource: Lookup, options?): Promise<resultData> {
        const group = await this.getResource(targetResource.ri, resourceTypeEnum.group)
        if (!group) {
            return rsc.NOT_FOUND;
        }
        if (group.mid.length === 0) {
            return rsc.NO_MEMBERS;
        }
        if (requestPrimitiveData.op === operationEnum.CREATE && group.mt !== resourceTypeEnum.mixed) {
            if (!allowedChildResources.get(group.mt)!.includes(requestPrimitiveData.ty)) {
                return rsc.INVALID_CHILD_RESOURCE_TYPE;
            }
        }
        let aggregatedResponse: { "m2m:agr": responsePrimitive[] } = {"m2m:agr": []};
        //for each member, make a new primitive request (recursively for fopt members)
        const childFopt = requestPrimitiveData.to.split('/fopt') ;
        try {
            for (const memberResource of group.mid) {
                requestPrimitiveData.to = memberResource + childFopt[1];
                const member_response = await this.primitiveGateway({"m2m:rqp": requestPrimitiveData})
                aggregatedResponse["m2m:agr"].push(member_response);
            }
            //TODO resolve adding to array issue
            // for (let i = 0; i < group.mid.length; i++){
            //     requestPrimitiveData.to = group.mid[i];
            //     const member_response = await this.primitiveGateway({"m2m:rqp": requestPrimitiveData})
            //     aggregatedResponse["m2m:agr"][i] = member_response;
            // }
            return {rsc: rsc.OK, pc: aggregatedResponse}
        } catch (e) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
    }
}
