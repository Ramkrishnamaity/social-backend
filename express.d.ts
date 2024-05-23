
// Augment the Request interface to include the custom property
// declare module "express" {
//     interface Request {
//         user?: ReqUser
//     }
// }

// declare module 'express-serve-static-core' {
//     interface Request {
//         user?: ReqUser // Replace 'any' with the actual user data type
//     }
// }


declare module "express" {
    interface Request {
        user?: {_id: string} // Use the User interface you defined
    }
}

