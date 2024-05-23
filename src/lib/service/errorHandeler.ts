// import { Error, MongooseError,Mongoerr } from "mongoose";

// const DBerror = (error: MongoError): string => {
//     // const errorLog: Error.ValidationError = error
//     // console.log('error', errorLog);
//     if (error. && error.message === 11000) {
//         return `${Object.keys(error.keyValue)[0]} already exists`;
//     } else if (error.name && error.name === "ValidationError") {
//         let message = error._message.split(" ")[0] + " -";
//         const objToArry = Object.keys(error.errors);
//         objToArry.forEach(function (key, i) {
//             // console.log('key, i', key, i);
//             message += ` ${key} ${Number(objToArry.length - 1) !== i ? "And" : "is required."}`
//         });
//         return message;
//     } else {
//         return `Server error. Please try again.`;
//     }
// }

// const InputError = (error: any): string => {
//     if (Object.keys(error).length > 0) {
//         return (Object.values(error)[0] as any).message;
//     } else {
//         return `Server error. Please try again.`;
//     }
// }
// export {
//     DBerror,
//     InputError

// }
