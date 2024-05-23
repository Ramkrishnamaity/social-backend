

export type UpdateProfileRequestType = {
    fristName: string
    lastName: string
    mobileNumber: string
    userImage: string
}

export type AffiliateRequestType = {
    affiliatedPersentage: string
    ownPersentage: string
}

export type CustomerWalletRequestType = {
    isAdd: boolean
    amount: number
    transactionID: string
}

export type SubscriptionRequetsType = {
    PRODUCT_NAME: string, 
    PLAN_NICKNAME: string, 
    CURRENCY: string, 
    PLAN_INTERVAL: "day" | "week" | "month" | "year", 
    PLAN_PRICE: number
}

export type PlanRequestType = {
    PRODUCT_NAME: string, 
    PLAN_NICKNAME: string
}