import { Request, Response } from "express"
import { CommonParamsType, ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import OrderModel from "../../Model/Customer/Order"
import mongoose from "mongoose"

const myOrder = (req: Request<CommonParamsType, any, {page?: number}>, res: Response<Res & {pageLimit?: number}>): void => {
	try {

		const page:any = req.query.page || 1
		const limit = 10
		const skip = (page - 1) * limit

		OrderModel.aggregate([
			{
				$match: {
					customerID: new mongoose.Types.ObjectId(req.params.id)
				}
			},
			{
				$lookup: {
					from: "client-products",
					foreignField: "_id",
					localField: "product._id",
					as: "productData",
					pipeline: [
						{
							$project: {
								productName: 1,
								productMedia: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$productData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					orderID: 1,
					product: 1,
					productData: 1,
					orderStatus: 1,
					createdOn: 1
				}
			},
			{
				$sort: { _id: -1 }
			},
			{
				$skip: skip
			},
			{
				$limit: limit
			}
		])
			.then(async result => {
				const totalData = await OrderModel.countDocuments({
					customerID: req.params.id
				})
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "OrderData Fetched",
					data: result,
					pageLimit: Math.ceil(totalData / limit)
				})
			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server Error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}


const myProductOrder = (req: Request, res: Response<Res & {pageLimit?: number}>): void => {
	try {

		const page:any = req.query.page || 1
		const limit = 10
		const skip = (page - 1) * limit

		OrderModel.aggregate([
			{
				$match: {
					vendorID: new mongoose.Types.ObjectId(req.params.id)
				}
			},
			{
				$lookup: {
					from: "client-products",
					foreignField: "_id",
					localField: "product._id",
					as: "productData",
					pipeline: [
						{
							$project: {
								productName: 1,
								productMedia: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$productData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					orderID: 1,
					product: 1,
					productData: 1,
					orderStatus: 1,
					createdOn: 1
				}
			},
			{
				$sort: { _id: -1 }
			},
			{
				$skip: skip
			},
			{
				$limit: limit
			}
			
		])
			.then(async result => {
				const totalData = await OrderModel.countDocuments({
					vendorID: req.params.id
				})
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "OrderData Fetched",
					data: result,
					pageLimit: Math.ceil(totalData / limit)
				})
			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					message: "Server Error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}


const specificOrder = (req: Request<CommonParamsType> & {user?: ReqWithAuth}, res: Response<Res>): void => {
	try {

		OrderModel.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(req.params.id)
				}
			},
			{
				$lookup: {
					from: "client-products",
					foreignField: "_id",
					localField: "product._id",
					as: "productData",
					pipeline: [
						{
							$project: {
								productName: 1,
								productMedia: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$productData",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					orderID: 1,
					product: 1,
					vendorID: 1,
					productData: 1,
					orderStatus: 1,
					paymentMode: 1,
					createdOn: 1
				}
			}
		])
			.then(async result => {
				if(result.length > 0){
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "OrderData Fetched",
						data: result[0]
					})
				} else{
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

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const changeStatus = (req: Request<CommonParamsType, any, {status: string}> & {user?: ReqWithAuth}, res: Response<Res>): void => {
	try {

		const customerID = req.header("X-User-Id")

		OrderModel.findById(
			req.params.id
		)
			.then(async result => {
				if(!result){
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Invalid Data..!"
					})
				} else{
					let flag = true

					if(result.vendorID.toString() === customerID) {
						flag = await result.changeStatus(req.body.status, true)
					} else{
						flag = await result.changeStatus("Canceled", false)
					}

					if(flag){
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "Order Status Updated"
						})
					} else{
						res.status(errorCode.BAD_REQUEST).json({
							status: false,
							message: "Invalid Status..!"
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

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}




const OrderController = {
	myOrder,
	myProductOrder,
	specificOrder,
	changeStatus
}

export default OrderController