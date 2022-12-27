import {operationEnum, requestPrimitive, responsePrimitive} from "./types/primitives.js";
import dataSource from "./database.js";
import {LookupRepository} from "./resources/lookup/lookup.repository.js";
import {notificationEventType, resourceTypeEnum, resourceTypeEnum as ty} from "./types/types.js";
import {AeManager} from "./resources/ae/ae.manager.js";
import {AccessControlPolicyManager} from "./resources/accessControlPolicy/accessControlPolicy.manager.js";
import {FlexContainerManager} from "./resources/flexContainer/flexContainer.manager.js";
import {SubscriptionManager} from "./resources/subscription/subscription.manager.js";
import {Subscription} from "./resources/subscription/subscription.entity.js";
import {cseConfig} from "./configs/cse.config.js";
import {request} from "./bindings/mqtt/request.js";
import {nanoid} from "nanoid";
import {resourceTypeToPrefix} from "./utils.js";

const allowedChildResources = new Map([
    [ty.AE, [ty.subscription, ty.container, ty.flexContainer, ty.accessControlPolicy]],
    [ty.CSEBase, [ty.AE, ty.container, ty.flexContainer, ty.accessControlPolicy]],
    [ty.accessControlPolicy, [ty.subscription]],
    [ty.flexContainer, [ty.subscription, ty.flexContainer, ty.container]],
    [ty.subscription, []],
]);

export class Dispatcher {
    private lookupRepository;
    private aeManager;
    private acpManager;
    private flexContainerManager;
    private subscriptionManager;

    constructor() {
        this.lookupRepository = new LookupRepository(dataSource);
        this.aeManager = new AeManager();
        this.acpManager = new AccessControlPolicyManager();
        this.flexContainerManager = new FlexContainerManager();
        this.subscriptionManager = new SubscriptionManager();
    }

    private static makeResponse({rsc, rqi, rvi, ot, pc}): responsePrimitive {
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
        }
        //check permissions if acpi exists
        if (targetResource.acpi) {
            const operationPrivileges = this.acpManager.checkPrivilges(requestPrimitive["m2m:rqp"].fr)
            if (!operationPrivileges.get(requestPrimitive["m2m:rqp"].op)) {
                return Dispatcher.makeResponse({
                    rsc: 5000, //TODO add correct error code
                    rqi: requestPrimitive["m2m:rqp"].ri,
                    rvi: requestPrimitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: ""
                })
            }
        }

        const targetResourceType: resourceTypeEnum = requestPrimitive["m2m:rqp"].op === operationEnum.CREATE ?
            requestPrimitive["m2m:rqp"].ty : targetResource.ty

        let responsePrim: responsePrimitive;

        switch (targetResourceType) {
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
}

