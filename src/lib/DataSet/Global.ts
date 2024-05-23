import { type Request } from "express"



export interface Res<data = any, error = any> {
    status: boolean
    data?: data
    dataLimit?: any
    massage: string
    error?: error
}

export interface ReqUser {
    _id: string
}


export type RequestClient = Request & { user?: ReqUser }


