export interface SubcriptionDataSet {
    name: string
    description: string
    image?: string
    validity: number
    price: string
    attributes?: any
    status?: boolean
    createdOn?: Date
    updatedOn?: Date
    isDeleted?: boolean
}

export interface ResSubcription {
    name: string
    description?: string
    image?: string
    validity?: number
    price?: string
    attributes?: any
}
