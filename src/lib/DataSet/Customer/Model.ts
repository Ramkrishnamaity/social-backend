import { Types } from "mongoose"


export type ProductModelType<T> = T & {
    categoryID: Types.ObjectId
    subcategoryID: Types.ObjectId
    customerID: Types.ObjectId
    clientID: Types.ObjectId
    productName: string
    productDesc: string
    productMedia: {
        url: string
        mediaType: string
    }[]
    price: number
    sellerAddress: {
        lat: string,
        long: string
    }[]
    discount?: {
        percentage: number,
        startDate: Date
        endDate: Date
    }
    stock?: number
    status?: boolean
    updateStock(isAdd: boolean, quantity: number): void
}

export type AddressModelType<T> = T & {
    customerID: Types.ObjectId
    name: string,
    mobileNo: string
    address: string
    landmark: string
    pincode: string
    addressType: string
    city: string
    state: string
    country: string
}

export type PostShareModelType<T> = T & {
    postID: Types.ObjectId
    reffererID: Types.ObjectId
    refferedUserID: Types.ObjectId[]
    // shallowCopy(refferedUserID: Types.ObjectId): Promise<void>
    // endPush(refferedUserID: Types.ObjectId): void
    // deepCopy(refferedUserID: Types.ObjectId, index: number): Promise<void>
}

export type OrdreModelType <T> = T & {
    orderID: string
    customerID: Types.ObjectId
    vendorID: Types.ObjectId
    product: {
        _id: Types.ObjectId
        price: number
        purchasePrice: number
        discount: number
        quantity: number
    }
    postID: Types.ObjectId
    address: {
        name: string
        mobileNo: string
        address: string
        landmark: string
        pincode: string
        addressType: string
        city: string
        state: string
        country: string
    }
    orderStatus: {
        status: string
        date: Date
    }[]
    paymentMode: string
    transactionID?: string
    createdOn: Date
    changeStatus(status: string, isVendor: boolean): Promise<boolean>
}

export type WishlistModelType <T> = T & {
    customerID: Types.ObjectId
    productID: Types.ObjectId
    postID: Types.ObjectId
    createdOn: Date
}