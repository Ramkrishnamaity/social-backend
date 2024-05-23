export interface AdminAuth {
    email: string
    password: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    userImage?: string

}

export interface LoginRes {
    token?: string
    userImage?: string
    lastName?: string
    fristName?: string
}
export interface AdminModels {
    email: string
    password: string
    fristName?: string
    lastName?: string
    mobileNumber?: string
    token: string
    createdOn?: Date
    updatedOn?: Date
    userImage?: string
}
