import { Types } from "mongoose"


export type PlanModelType = {
    planID?: string
    productID?: string
    name: string
    description?: string
    image: string
    price: number
    currency: string
	interval: string
	isDeleted: boolean
	createdOn: Date
	updatedOn: Date
    addPlanIDProductID(planID: string, productID: string): void 
}

export type SubscriptionModelType = {
    customerID?: string
    clientID: Types.ObjectId
    planID: Types.ObjectId
    status: boolean
    isDeleted: boolean
	createdOn: Date
	updatedOn: Date
    addsubscriptionID(subsID: string): void 
}

