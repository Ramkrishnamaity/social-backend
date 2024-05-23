import { Types } from "mongoose"

export type CustomerRequestType = {
    email: string
    image?: string
    fristName: string
    lastName: string
}

export type UpdateCustomerRequestType = {
    email: string
    image?: string
}

export type PostRequestType = {
    customerID?: string
    postTitle: string
    postMedia: {
        url: string
        mediaType: string
    }[]
    products?: Types.ObjectId[]
    visibility?: string
}

export type UpdatePostRequestType = {
    postTitle: string
    postMedia: {
        url: string
        mediaType: string
    }[]
    products?: Types.ObjectId[]
    visibility?: string
}

export type ProductRequestType = {
    categoryID: Types.ObjectId
    subcategoryID: Types.ObjectId
    customerID: Types.ObjectId
    productName: string
    productDesc: string
    productMedia:  {
        url: string
        mediaType: string
    }[]
    price: number
    discount?: {
        percentage: number,
        startDate: Date
        endDate: Date
    }
    sellerAddress: {
        lat: string,
        long: string
    }[]
    stock?: number
}

export type UpdateProductRequestType = {
    productName: string
    productDesc: string
    productMedia:  {
        url: string
        mediaType: string
    }[]
    price: number

    sellerAddress: {
        lat: string,
        long: string
    }[]
    stock?: number
}

export type UpdateProductDiscountRequestType = {
    discount: {
        percentage: number,
        startDate: Date
        endDate: Date
    }
}

export type LikeRequestType = {
    customerID: string,
    like: boolean
}

export type CommentRequestType = {
    customerID: Types.ObjectId
    postID: Types.ObjectId
    comment: string
}

export type UpdateCommentRequestType = {
    comment: string
}

export type ReportModelType = {
    customerID: Types.ObjectId
    postID: Types.ObjectId
    title: string
    note: string
}


export type AddressRequestType = {
    customerID: string
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

export type UpdateAddressRequestType = {
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

export type CheckoutRequestType = {
    customerID: string
    productID: string
    postID: string
    quantity: string
    addressID: string
    paymentMode: string
}

export type WishlistRequestType = {
    customerID: string
    postID?: string
    wishlist: boolean
}

export type WithdrawRequestType = {
    customerID: string
    transactionID: string
    amount: number
}

export type ProfileRequestType = {
    fristName: string,
    lastName: string,
    image: string
}

