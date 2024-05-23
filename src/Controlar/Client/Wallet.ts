import { Request, Response } from "express"
import { ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import WalletModel from "../../Model/Common/Wallet"
import mongoose from "mongoose"
import TransactionModel from "../../Model/Common/Transaction"


const getBalance = (req: Request<any, any, { page?: number }> & {user?: ReqWithAuth}, res: Response<Res & {totalPage?: number}>): void => {
	try {
		const limit = 10

		if (!req.query.page) {
			WalletModel.aggregate([
				{
					$match: {
						userID: new mongoose.Types.ObjectId(req.user?._id)
					}
				},
				{
					$lookup: {
						from: "transactions",
						foreignField: "userID",
						localField: "userID",
						as: "transactions",
						pipeline: [
							{
								$lookup: {
									from: "client-products",
									foreignField: "_id",
									localField: "productID",
									as: "product",
									pipeline: [
										{
											$project: {
												_id: 1,
												productName: 1,
												productMedia: 1
											}
										}
									]
								}
							},
							{
								$unwind: {
									path: "$product",
									preserveNullAndEmptyArrays: true
								}
							},
							{
								$limit: limit
							},
							{
								$sort: { _id: -1 }
							}
						]
					}
				}
			])
				.then(async result => {
					if (result.length !== 0) {
						const totalPage = await TransactionModel.countDocuments({userID: req.user?._id})
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "Wallet Data Fetched.",
							data: result[0],
							totalPage: Math.ceil(totalPage / limit) - 1
						})
					} else {
						res.status(errorCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "Invalid Data..!"
						})
					}
				})
				.catch(error => {
					res.status(errorCode.SERVER_ERROR).json({
						status: false,
						message: "Server Error..!",
						error
					})
				})
		} else {
			const page:any = req.query.page
			const skip = limit + limit * (page - 1)

			TransactionModel.aggregate([
				{
					$match: {
						userID: new mongoose.Types.ObjectId(req.header("X-User-Id"))
					}
				},
				{
					$lookup: {
						from: "client-products",
						foreignField: "_id",
						localField: "productID",
						as: "product",
						pipeline: [
							{
								$project: {
									_id: 1,
									productName: 1,
									productMedia: 1
								}
							}
						]
					}
				},
				{
					$unwind: {
						path: "$product",
						preserveNullAndEmptyArrays: true
					}
				},
				{ $skip: skip },
				{ $limit: limit },
				{
					$sort: { _id: -1 }
				}
			])
				.then(result => {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Transaction Data Fetched.",
						data: result
					})
				})
				.catch(error => {
					res.status(errorCode.SERVER_ERROR).json({
						status: false,
						message: "Server Error..!",
						error
					})
				})

		}

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}


const ClientWalletController = {
	getBalance
}

export default ClientWalletController

