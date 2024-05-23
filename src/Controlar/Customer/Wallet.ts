import { Request, Response } from "express"
import { Res } from "../../lib/DataSet/Common"
import WalletModel from "../../Model/Common/Wallet"
import { errorCode } from "../../lib/service/responseCode"
import mongoose from "mongoose"
import TransactionModel from "../../Model/Common/Transaction"
import { WithdrawRequestType } from "../../lib/DataSet/Customer/Request"

const getBalance = (req: Request<any, any, { page?: number }>, res: Response<Res & {totalPage?: number}>): void => {
	try {
		const limit = 10

		if (!req.query.page) {
			WalletModel.aggregate([
				{
					$match: {
						userID: new mongoose.Types.ObjectId(req.header("X-User-Id"))
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
						const totalPage = await TransactionModel.countDocuments({userID: req.header("X-User-Id")})
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "Wallet Data Fetched.",
							data: result[0],
							totalPage:  Math.ceil(totalPage / limit) - 1
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

const moneyWithdraw = (req: Request<any, any, WithdrawRequestType>, res: Response<Res>): void => {
	try{

		WalletModel.findOne(
			{
				userID: req.body.customerID
			}
		)
			.then(async result => {

				if(!result){
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Invalid Data..!"
					})
				} else{

					if(result.balance < req.body.amount){
						res.status(errorCode.BAD_REQUEST).json({
							status: false,
							message: "Insufficient Balance..!"
						})
					} else{

						await result.debit(req.body.amount, req.body.transactionID)
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "wallet Updated..!"
						})

					}

				}

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server Error..!",
					error
				})
			})

	} catch(error){
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}


const CustomerWalletController = {
	getBalance,
	moneyWithdraw
}

export default CustomerWalletController

