import { Types } from "mongoose"

export interface CustomerAuth {
    userID: string
    email: string
    image?: string
}

export interface LoginResCustomer {
    token?: string
    userImage?: string
    lastName?: string
    fristName?: string
    clientID?: string
}

export interface CustomerModels {
    email: string
    fristName?: string,
    lastName?: string
    clientID: Types.ObjectId
    image?: string
    createdOn: Date
    updatedOn: Date
    isDeleted: boolean
    status: boolean
}
export interface CustomerUpdate {
    email?: string
    password?: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    token?: string
    createdOn?: Date
    updatedOn?: Date
    userImage?: string
    clientID?: string
    status?: boolean

}
