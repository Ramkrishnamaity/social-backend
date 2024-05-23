import { Types } from "mongoose"

export type WalletModelType <T = Record<string, any>> = T & {
    userID: Types.ObjectId
    balance: number
    debit(amount: number, tag: string, transactionID?: string, productID?: string): Promise<void>
    credit(amount: number, tag: string, transactionID?: string, productID?: string): Promise<void>
}

export type TransactionModelType <T> = T & {
    userID: Types.ObjectId
    amount: number
    type: string
	transactionID?: string
    productID?: Types.ObjectId
    tag: string
    date: Date
}


export type WithdrawModelType <T> = T & {
    customerID: Types.ObjectId
    amount: number
    date: Date
}

