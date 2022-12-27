import {Type} from "@sinclair/typebox";

export const headerSchema = Type.Object({
    "X-M2M-Origin": Type.String(),
    "X-M2M-RI": Type.String(),
    "X-M2M-RVI": Type.Union([
        Type.Literal("1"),
        Type.Literal("2"),
        Type.Literal("2a"),
        Type.Literal("3"),
        Type.Literal("4")
    ]),
    "Content-Type": Type.String(),
    "Accept": Type.Literal("application/json")
})
