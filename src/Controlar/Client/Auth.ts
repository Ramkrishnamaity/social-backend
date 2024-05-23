import type { Request, Response } from "express"
import type { ClientAuth, LoginRes } from "../../lib/DataSet/ClientAuth"
import type { Res } from "../../lib/DataSet/Global"
import ClientModel from "../../Model/Client/ClientModel"
import AdminModel from "../../Model/AdminModel"
import ClientAfflitedPersentageModel from "../../Model/ClientAftlitePersentage"

import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { ReqWithAuth } from "../../lib/DataSet/Common"
import { UpdateProfileRequestType } from "../../lib/DataSet/Client/Request"
import { errorCode } from "../../lib/service/responseCode"
import WalletModel from "../../Model/Common/Wallet"
import StripeUtilityMethods from "../../lib/service/Stripe"
// import StripeUtilityMethods from "../../lib/service/Stripe"

// const getTokenData = async (token: string) => {
//     let adminData = ClientModel.findOne({ token: token }).exec();
//     return adminData;
// };

function createToken(data: any): string {
	return jwt.sign(data, "admintoken")
}

// const ClientLogin = (req: Request<any, any, ClientAuth>, res: Response<Res<LoginRes>>): any => {
//     const { email, password } = req.body;

//     ClientModel.findOne({ email, status: true })
//         .then(async (data: any) => {
//             console.log("data", data)
//             if (data === null) {
//                 res.status(301).json({
//                     status: false,
//                     massage: 'Invalid Email ID'
//                 })
//             } else {
//                 const validPassword: boolean = await bcrypt.compare(password, data.password);
//                 if (!validPassword) {
//                     return res.status(401).json({
//                         status: false,
//                         massage: 'Invalid Password !'
//                     });
//                 } else {
//                     return res.status(200).json({
//                         status: true,
//                         massage: 'Login succesfully !',
//                         data: {
//                             token: data.token,
//                             userImage: data.userImage,
//                             fristName: data.fristName,
//                             lastName: data.lastName
//                         }
//                     });
//                 }
//             }
//         }).catch((error) => {
//             console.log("err", error)
//         })
// }

const ClientLogin = (req: Request<any, any, ClientAuth>, res: Response<Res<LoginRes>>): any => {
	const { email, password } = req.body

	AdminModel.findOne({ email, status: true })
		.then(async (data: any) => {
			console.log("data", data)
			if (data === null) {
				// res.status(301).json({
				//     status: false,
				//     massage: 'Invalid Email ID'
				// })
				ClientModel.findOne({ email, status: true })
					.then(async (data) => {
						if (data === null) {
							res.status(301).json({
								status: false,
								massage: "Invalid Email ID"
							})
						} else {
							const validPassword: boolean = await bcrypt.compare(password, data.password)
							if (!validPassword) {
								return res.status(401).json({
									status: false,
									massage: "Invalid Password !"
								})
							} else {
								return res.cookie("token", data.token, { httpOnly: true }).status(200).json({
									status: true,
									massage: "Login succesfully !",
									data: {
										token: data.token,
										type: "Client",
										userImage: data.userImage,
										fristName: data.fristName,
										lastName: data.lastName
									}
								})
							}
						}
					}).catch(() => {
						return res.status(301).json({
							status: false,
							massage: "Server Error !"
						})
					})
			} else {
				const validPassword: boolean = await bcrypt.compare(password, data.password)
				if (!validPassword) {
					return res.status(401).json({
						status: false,
						massage: "Invalid Password !"
					})
				} else {
					return res.status(200).json({
						status: true,
						massage: "Login succesfully !",
						data: {
							token: data.token,
							type: "Admin",
							userImage: data.userImage,
							fristName: data.fristName,
							lastName: data.lastName
						}
					})
				}
			}
		}).catch(() => {
			// console.log("err", error)
			return res.status(301).json({
				status: false,
				massage: "Server Error !"
			})
		})
}

const ClientSignup = (req: Request<any, any, ClientAuth>, res: Response<Res<LoginRes>>): void => {
	try {
		const _id = new mongoose.Types.ObjectId()
		const token: string = createToken({ _id, userType: "client" })

		const secretKey: string = uuidv4()
		const apiKey: string = createToken({ secretKey: secretKey })

		bcrypt.hash(req.body.password, 10).then((password: any) => {

			const dataSet = new ClientModel({ ...req.body, userName: secretKey, _id, token, password, apiKey, secretKey })

			dataSet.save()
				.then(async (data: any) => {
					// console.log(data)
					const persentageDataset = {
						clientID: _id
					}

					await new ClientAfflitedPersentageModel(persentageDataset).save()

					await WalletModel.create({ userID: _id })
					const customerID = await StripeUtilityMethods.createCustomer(req.body.email, `${req.body.fristName} ${req.body.lastName}`)
					data.addCustomerID(customerID)

					res.status(200).json({
						status: true,
						massage: "client signup succesfully!",
						data: {
							token: data.token,
							userImage: data.userImage,
							fristName: data.fristName,
							lastName: data.lastName
						}
					})
				})
				.catch((error: any) => {
					console.log(error)
					return res.status(500).json({
						status: false,
						error,
						massage: error.message
					})
				})
		}).catch((error: any) => {
			return res.status(301).json({
				status: false,
				error,
				massage: "Server error. Please try again."
			})
		})
	} catch (error) {
		res.status(301).json({
			status: false,
			error,
			massage: "Server error. Please try again. error"
		})
	}
}

const getProfile = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): any => {
	ClientModel.aggregate([
		{
			$match: {
				_id: new mongoose.Types.ObjectId(req.user?._id)
			}
		},
		{
			$project: {
				email: 1,
				fristName: 1,
				lastName: 1,
				mobileNumber: 1,
				userImage: 1,
				subcriptionPlanID: 1
			}
		}

	]).then((data: any) => {
		return res.status(200).json({
			status: true,
			massage: "Get data succesfully !",
			data: data[0]
		})
	}).catch((error: any) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const updateProfile = (req: Request<any, any, UpdateProfileRequestType> & { user?: ReqWithAuth }, res: Response<Res>): any => {
	ClientModel.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				...req.body,
				updatedOn: new Date()
			}
		}
	)
		.then(() => {
			return res.status(200).json({
				status: true,
				massage: "upadated data succesfully !"
			})
		}).catch((error: any) => {
			return res.status(500).json({
				status: false,
				massage: "Server error ! Data not found !",
				error
			})
		})
}

const getApiKeys = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		ClientModel.findById(req.user?._id, { _id: 1, apiKey: 1, secretKey: 1 })
			.then(result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					massage: "Api Key Fetched Successfully.",
					data: result
				})
			})
			.catch(error => {
				res.status(errorCode.NOT_FOUND_ERROR).json({
					status: false,
					massage: "Invalid Data..!",
					error
				})
			})
	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			massage: "server Error..!",
			error
		})
	}



}

export {
	ClientLogin,
	ClientSignup,
	getProfile,
	getApiKeys,
	updateProfile
}
