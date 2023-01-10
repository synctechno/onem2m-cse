import {Type } from '@sinclair/typebox'

export const sdtSchemaCreate = Type.Union([
    Type.Object({
        "cod:color": Type.Object({
            rn: Type.String(),
            cnd: Type.Literal("org.onem2m.common.moduleclass.colour"),
            red: Type.Number(),
            green: Type.Number(),
            blue: Type.Number(),
        })
    }),
    Type.Object({
        "cod:colSn": Type.Object({
            rn: Type.String(),
            cnd: Type.Literal("org.onem2m.common.moduleclass.colourSaturation"),
            colourSaturation: Type.Number(),
        })
    }),
])


export const sdtSchemaUpdate = Type.Union([
    Type.Object({
        "cod:color": Type.Object({
            red: Type.Optional(Type.Number()),
            green: Type.Optional(Type.Number()),
            blue: Type.Optional(Type.Number()),
        })
    }),
    Type.Object({
        "cod:colSn": Type.Object({
            colourSaturation: Type.Optional(Type.Number()),
        })
    }),
])
