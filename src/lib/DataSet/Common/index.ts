
export type ReqWithAuth <T = Record<string, any>> = T & {
    _id: string
}

export type Res <T = Record<string, any>> = {
    status: boolean
    message: string
    data?: T
    error?: any
}

export type CommonModelType = {
    createdOn?: Date
    updatedOn?: Date
    isDeleted?: boolean
}

export type CommonParamsType = {
    id: string
}

export type PostShareParamsType = {
    postID: string
    userID: string
}