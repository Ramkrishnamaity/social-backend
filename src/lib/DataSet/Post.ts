import { Types } from "mongoose"

export interface mediaDataSet {
    url: string
    mediaType: string
}

export interface postDataSet {
    customerID: Types.ObjectId
    clientID: Types.ObjectId
    postTitle: string
    postMedia: mediaDataSet[]
    products?: Types.ObjectId[]
    visibility?: string
    createdOn?: Date
    updatedOn?: Date
    isDeleted: boolean
    status?: boolean
}
// export interface postModel {
//     customerID?: object
//     clientID?: object
//     postTitle: string
//     postMedia: mediaDataSet[]
//     visibility?: string
//     createdOn?: Date
//     updatedOn?: Date
// }
