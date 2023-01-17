import {operationEnum, requestPrimitive, responsePrimitive} from "./types/primitives.js";
import dataSource from "./database.js";
import {LookupRepository} from "./resources/lookup/lookup.repository.js";
import {filterCriteria, notificationEventType, resourceTypeEnum, resourceTypeEnum as ty} from "./types/types.js";
import {AeManager} from "./resources/ae/ae.manager.js";
import {AccessControlPolicyManager} from "./resources/accessControlPolicy/accessControlPolicy.manager.js";
import {FlexContainerManager} from "./resources/flexContainer/flexContainer.manager.js";
import {SubscriptionManager} from "./resources/subscription/subscription.manager.js";
import {Subscription} from "./resources/subscription/subscription.entity.js";
import {cseConfig} from "./configs/cse.config.js";
import {request} from "./bindings/mqtt/request.js";
import {nanoid} from "nanoid";
import {resourceTypeToPrefix} from "./utils.js";
import {Lookup} from "./resources/lookup/lookup.entity.js";
import {CseBaseManager} from "./resources/cseBase/cseBase.manager.js";
import {ContainerManager} from "./resources/container/container.manager.js";
import {ContentInstanceManager} from "./resources/contentInstance/contentInstance.manager.js";

const allowedChildResources = new Map([
    [ty.AE, [ty.subscription, ty.container, ty.flexContainer, ty.accessControlPolicy]],
    [ty.CSEBase, [ty.AE, ty.container, ty.flexContainer, ty.accessControlPolicy]],
    [ty.accessControlPolicy, [ty.subscription]],
    [ty.flexContainer, [ty.subscription, ty.flexContainer, ty.container]],
    [ty.subscription, []],
    [ty.container, [ty.container, ty.flexContainer, ty.contentInstance, ty.subscription]],
    [ty.contentInstance, []]
]);

export class Dispatcher {
    private lookupRepository;
    private cseBaseManager;
    private aeManager;
    private acpManager;
    private flexContainerManager;
    private subscriptionManager;
    private containerManager;
    private contentInstanceManager;

    constructor() {
        this.lookupRepository = new LookupRepository(dataSource);
        this.cseBaseManager = new CseBaseManager()
        this.aeManager = new AeManager();
        this.acpManager = new AccessControlPolicyManager();
        this.flexContainerManager = new FlexContainerManager();
        this.subscriptionManager = new SubscriptionManager();
        this.containerManager = new ContainerManager();
        this.contentInstanceManager = new ContentInstanceManager()
    }

    private static makeResponse({rsc, rqi, rvi, ot = new Date(), pc}): responsePrimitive {
        return {
            "m2m:rsp": {
                rsc,
                rqi,
                rvi,
                ot,
                pc
            }
        }
    }

    async process(requestPrimitive: requestPrimitive): Promise<responsePrimitive> {
        const targetResource = await this.lookupRepository.findOneBy({path: requestPrimitive["m2m:rqp"].to})
        //targetResource resource does not exist
        if (!targetResource) {
            return Dispatcher.makeResponse({
                rsc: 5000, //TODO add correct error code
                rqi: requestPrimitive["m2m:rqp"].ri,
                rvi: requestPrimitive["m2m:rqp"].rvi,
                ot: new Date(),
                pc: ""
            })
        }
        if (requestPrimitive["m2m:rqp"].op === operationEnum.CREATE) {
            //targetResource resource does not allow this type of child resource
            if (!allowedChildResources.get(targetResource.ty)?.includes(requestPrimitive["m2m:rqp"].ty)) {
                return Dispatcher.makeResponse({
                    rsc: 5000, //TODO add correct error code
                    rqi: requestPrimitive["m2m:rqp"].ri,
                    rvi: requestPrimitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: ""
                })
            }

            //resource with the same resourceName exists
            const siblingResources = await this.lookupRepository.findBy({pi: targetResource.ri});
            for (const resource of siblingResources){
                let rn = resource.path.split('/').at(-1);
                const prefix = Object.keys(requestPrimitive["m2m:rqp"]["pc"])[0]
                if (requestPrimitive["m2m:rqp"]["pc"][prefix].rn === rn){
                    return Dispatcher.makeResponse({
                        rsc: 4000, //TODO add correct error code
                        rqi: requestPrimitive["m2m:rqp"].ri,
                        rvi: requestPrimitive["m2m:rqp"].rvi,
                        ot: new Date(),
                        pc: ""
                    })
                }
            }
        }
        //check permissions if acpi exists
        if (targetResource.acpi && targetResource.ty !== resourceTypeEnum.accessControlPolicy) {
            const operationPrivileges =
                this.acpManager.checkPrivilges(requestPrimitive["m2m:rqp"].fr)
            if (!operationPrivileges.get(requestPrimitive["m2m:rqp"].op)) {
                return Dispatcher.makeResponse({
                    rsc: 5000, //TODO add correct error code
                    rqi: requestPrimitive["m2m:rqp"].ri,
                    rvi: requestPrimitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: ""
                })
            }
        } else if (targetResource.ty === resourceTypeEnum.accessControlPolicy){
            const operationPrivileges = this.acpManager.checkPrivileges(requestPrimitive["m2m:rqp"].fr)
        }

        const targetResourceType: resourceTypeEnum = requestPrimitive["m2m:rqp"].op === operationEnum.CREATE ?
            requestPrimitive["m2m:rqp"].ty : targetResource.ty

        if (requestPrimitive["m2m:rqp"].op === operationEnum.RETRIEVE && Object.keys(requestPrimitive["m2m:rqp"].fc as Object).length !== 0){
            const pc = await this.discoveryProcedure(requestPrimitive["m2m:rqp"].fc!, targetResource.ri);
            if (pc){
                return Dispatcher.makeResponse({
                    rsc: 2001, //TODO add correct error code
                    rqi: requestPrimitive["m2m:rqp"].ri,
                    rvi: requestPrimitive["m2m:rqp"].rvi,
                    pc: pc
                })
            }
        }

        let responsePrim: responsePrimitive;

        switch (targetResourceType) {
            case ty.CSEBase: {
                responsePrim = await this.cseBaseManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.AE: {
                responsePrim = await this.aeManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.accessControlPolicy: {
                responsePrim = await this.acpManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.flexContainer: {
                responsePrim = await this.flexContainerManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.subscription: {
                responsePrim = await this.subscriptionManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.container: {
                responsePrim = await this.containerManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            case ty.contentInstance: {
                responsePrim = await this.contentInstanceManager.primitiveHandler(requestPrimitive, targetResource);
                break;
            }
            default:
                return Dispatcher.makeResponse({
                    rsc: 5000, //TODO add correct error code
                    rqi: requestPrimitive["m2m:rqp"].ri,
                    rvi: requestPrimitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: ""
                })
        }

        if (![2000, 2001, 2002, 2004].includes(responsePrim["m2m:rsp"].rsc)) {
            return responsePrim;
        }

        const subs: Subscription[] = await this.checkSubscriptions(targetResource.ri);
        //TODO need to refactor this part, add support for other notificationEventTypes
        for (const sub of subs) {
            if ((sub.enc.net?.includes(notificationEventType.UPDATE) && requestPrimitive["m2m:rqp"].op === operationEnum.UPDATE)
                || (sub.enc.net?.includes(notificationEventType.CREATE) && requestPrimitive["m2m:rqp"].op === operationEnum.CREATE)) {
                const prefix: any = resourceTypeToPrefix.get(targetResource.ty)
                const pc = {
                    "m2m:sgn": {
                        nev:{
                            rep: {
                                [prefix]: responsePrim["m2m:rsp"].pc
                            },
                            net: sub.enc.net
                        },
                        sur: sub.ri
                    }
                }
                for (const notificationUrl of sub.nu){
                    request({
                        "m2m:rqp": {
                            op: operationEnum.NOTIFY,
                            fr: cseConfig.cseId,
                            to: notificationUrl,
                            ri: nanoid(10),
                            rvi: 3,
                            ty: targetResource.ty,
                            pc: pc
                        }
                    })
                }
            }
        }
        return responsePrim;
    }

    checkSubscriptions(resourceId) {
        return this.subscriptionManager.getResourceSubscriptions(resourceId);
    }

    sendNotification(sub: Subscription) {

    }

    async discoveryProcedure(fc: filterCriteria, pi: string,) {
        fc.fu = 1; //temporary
        switch (Number(fc.fu)) {
            case 1: { //discovery
                const result: Lookup[] = await this.lookupRepository.findBy({pi});
                if (Number(fc?.rcn) === 8) {
                    let pc: Object = {
                        "m2m:rrl": {
                            "m2m:rrf": []
                        }
                    };
                    for (const resourceLookup of result) {
                        let rn = resourceLookup.path.split('/').at(-1);
                        pc["m2m:rrl"]["m2m:rrf"].push(
                            {
                                nm: rn,
                                typ: resourceLookup.ty,
                                val: resourceLookup.path
                            }
                        )
                    }
                    return pc;
                } else {
                    return null;
                }
            }
        }

    }
}

