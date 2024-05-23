import { Request, Response } from "express"
import { ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import TransactionModel from "../../Model/Common/Transaction"
import mongoose from "mongoose"


const weeklyGraph = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const endDate = new Date()
		// startDate.setDate(startDate.getDate() - 28)
		// console.log(startDate, "==", endDate)

		// Initialize an array to store the intervals
		const weekIntervals = []
		for (let i = 0; i < 4; i++) {
			const startDate = new Date(endDate)
			startDate.setDate(startDate.getDate() - (i + 1) * 7)


			const endDateOfWeek = new Date(endDate)
			endDateOfWeek.setDate(endDateOfWeek.getDate() - i * 7 - 1)

			weekIntervals.push({
				week: i + 1,
				startDate,
				endDateOfWeek
			})
		}
		// console.log(weekIntervals, "==", endDate)


		TransactionModel.aggregate([
			{
				$match: {
					userID: new mongoose.Types.ObjectId(req.user?._id),
					tag: "Product Sell",
					date: {
						$gte: weekIntervals[3].startDate,
						$lte: endDate
					}
				}
			},
			{
				$addFields: {
					week: {
						$switch: {
							branches: [
								{
									case: { $gte: ["$date", weekIntervals[0].startDate] },
									then: weekIntervals[0]
								},
								{
									case: { $gte: ["$date", weekIntervals[1].startDate] },
									then: weekIntervals[1]
								},
								{
									case: { $gte: ["$date", weekIntervals[2].startDate] },
									then: weekIntervals[2]
								},
								{
									case: { $gte: ["$date", weekIntervals[3].startDate] },
									then: weekIntervals[3]
								}
							],
							default: "Unknown" // Default value if the transaction date does not match any interval
						}
					}
				}
			},
			{
				$group: {
					_id: "$week",
					transaction: { $sum: "$amount" }
				}
			},
			{
				$project: {
					__v: 0,
					userID: 0,
					week: 0
				}
			},
			{
				$sort: { _id: 1 }
			}
		])
			.then(result => {

				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Weekly Transaction Data get Successfully.",
					data: result
				})

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server error..!",
			error
		})
	}
}


const monthlyGraph = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		const endDate = new Date()
		const monthIntervals = []

		for (let i = 0; i < 12; i++) {
			const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - (i + 1), 1)
			const endDateOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() - i, 0)

			monthIntervals.push({
				month: i + 1,
				startDate,
				endDate: endDateOfMonth
			})
		}

		// console.log(monthIntervals, "==", endDate)


		TransactionModel.aggregate([
			{
				$match: {
					userID: new mongoose.Types.ObjectId(req.user?._id),
					tag: "Product Sell",
					date: {
						$gte: monthIntervals[3].startDate,
						$lte: endDate
					}
				}
			},
			{
				$addFields: {
					month: {
						$switch: {
							branches: [
								{
									case: { $gte: ["$date", monthIntervals[0].startDate] },
									then: monthIntervals[0]
								},
								{
									case: { $gte: ["$date", monthIntervals[1].startDate] },
									then: monthIntervals[1]
								},
								{
									case: { $gte: ["$date", monthIntervals[2].startDate] },
									then: monthIntervals[2]
								},
								{
									case: { $gte: ["$date", monthIntervals[3].startDate] },
									then: monthIntervals[3]
								}
							],
							default: "Unknown" // Default value if the transaction date does not match any interval
						}
					}
				}
			},
			{
				$group: {
					_id: "$month",
					transaction: { $sum: "$amount" }
				}
			},
			{
				$project: {
					__v: 0,
					userID: 0,
					month: 0
				}
			},
			{
				$sort: { _id: 1 }
			}
		])
			.then(result => {

				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Monthly Transaction Data get Successfully.",
					data: result
				})

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server error..!",
			error
		})
	}
}

const lastTransaction = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		TransactionModel.aggregate([
			{
				$match: {
					userID: new mongoose.Types.ObjectId(req.user?._id),
					tag: "Product Sell"
				}
			},
			{
				$lookup: {
					from: "orders",
					localField: "transactionID", // Use _id from the previous group stage
					foreignField: "orderID", // Assuming productID in orders collection
					as: "order",
					pipeline: [
						{
							$lookup: {
								from: "customers",
								localField: "customerID", // Use _id from the previous group stage
								foreignField: "_id", // Assuming productID in orders collection
								as: "customer",
								pipeline: [
									{
										$project: {
											fristName: 1,
											lastName: 1,
											image: 1,
											email: 1
										}
									}
								]
							}
						},
						{
							$lookup: {
								from: "customers",
								localField: "vendorID", // Use _id from the previous group stage
								foreignField: "_id", // Assuming productID in orders collection
								as: "vendor",
								pipeline: [
									{
										$project: {
											fristName: 1,
											lastName: 1,
											image: 1,
											email: 1
										}
									}
								]
							}
						},
						{
							$lookup: {
								from: "client-products",
								localField: "product._id", // Use _id from the previous group stage
								foreignField: "_id", // Assuming productID in orders collection
								as: "productData"
							}
						},
						{
							$unwind: {
								path: "$vendor",
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$unwind: {
								path: "$productData",
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$unwind: {
								path: "$customer",
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$addFields: {
								"product.name": "$productData.productName"
							}
						},
						{
							$project: {
								vendor: 1,
								customer: 1,
								product: 1,
								orderID: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$order",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					amount: 1,
					type: 1,
					tag: 1,
					transactionID: 1,
					date: 1,
					order: 1
				}
			},
			{
				$sort: {
					date: -1
				}
			},
			{
				$limit: 10
			}
		])
			.then(result => {

				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Last Recent Transaction fetched Successfully.",
					data: result
				})

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server error..!",
			error
		})
	}
}


const ClientTransactionController = {
	weeklyGraph,
	monthlyGraph,
	lastTransaction
}

export default ClientTransactionController