import { type Types } from "mongoose"

export interface SubCategoryDataSet {
    name: string
    description?: string
    image?: string
    categoryID: Types.ObjectId
    createdOn?: Date
    updatedOn?: Date
    isDeleted?: boolean
    status?: boolean

    linkUser: (userID: string) => Promise<void>
    unLinkUser: (userID: string) => Promise<void>
}

export interface ClientSubCategoryDataSet {
    userID: Types.ObjectId
    subcategories: Types.ObjectId[]
}

export interface ResSubCategory {
    name: string
    description?: string
    image?: string
    categoryData?: object
    categoryID?: string
}
