import {RegularResource} from "../baseResource/base.entity.js";
import {eventNotificationCriteria, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {Type} from "class-transformer";
import {Equals, IsNotEmptyObject, IsOptional, IsString, ValidateNested} from "class-validator";
import {EventNotificationCriteria} from "../../validationClasses.js";

@Entity("subscription")
export class Subscription extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.subscription
    })
    ty? = resourceTypeEnum.subscription;

    @IsNotEmptyObject(undefined, {groups: ['create', 'update']})
    @ValidateNested({groups: ['create', 'update']})
    @Type(() => EventNotificationCriteria)
    @Column({
        type: "json",
        nullable: true})
    enc: eventNotificationCriteria //eventNotificationCriteria

    @IsString({each: true, groups: ['create', 'update']})
    @Column("simple-array")
    nu: string[] //notificationURI

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column()
    cr?: string
}
