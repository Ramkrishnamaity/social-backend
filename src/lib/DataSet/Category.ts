import { type Types } from "mongoose"

export type CategoryDataSet = {
    name: string
    description?: string

    createdOn?: Date
    updatedOn?: Date
    isDeleted?: boolean
    status?: boolean
    linkUser: (userID: string) => Promise<void>
    unLinkUser: (userID: string) => Promise<void>
}

export interface ClientCategoryDataSet {
    userID: Types.ObjectId
    categories: Types.ObjectId[]
    subcategories: Types.ObjectId[]
}

export interface ResCategory {
    name: string
    description?: string

}
