export interface MediaDataset {
    url: string
    mediaType: string
}

export interface ProductDataset {
    customerID: object
    productName: string
    categoryID: object
    subCategoryID: object
    description: string
    price: string
    media: MediaDataset[]
    sellerAddress?: object
    createdOn?: Date
    modifiedOn?: Date
    isDeleted?: boolean
    enableStatus?: boolean
}
