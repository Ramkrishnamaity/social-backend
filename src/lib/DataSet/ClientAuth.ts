export interface ClientAuth {
    email: string
    password: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    userImage?: string
}

export interface ClientModels {
    customerID?: string
    email: string
    password: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    token: string
    apiKey: string
    secretKey: string
    userImage?: string
    subcriptionPlanID?: string
    status?: boolean
    createdOn?: Date
    updatedOn?: Date
    isDeleted?: boolean
    addCustomerID(customerID: string): void
}

export interface LoginRes {
    token?: string
    userImage?: string
    lastName?: string
    fristName?: string
    type?: string
}

export interface ClientUpdate {
    email: string
    password: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    token: string
    secretKey?: string
    createdOn?: Date
    updatedOn?: Date
    userImage?: string
    subcriptionPlanID?: string
    status?: boolean
}
