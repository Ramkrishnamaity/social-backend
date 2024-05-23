import type { Request, Response } from "express"
import { type Res } from "../../lib/DataSet/Global"
import CustomerModel from "../../Model/Customer/CustomerModel"
import mongoose from "mongoose"
import { type CustomerUpdate } from "../../lib/DataSet/CustomerAuth"
import { ReqWithAuth } from "../../lib/DataSet/Common"

const getCustomr = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	CustomerModel.countDocuments({ clientID: new mongoose.Types.ObjectId(req?.user?._id) }).exec().then((count) => {
		CustomerModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req?.user?._id)
				}
			},
			{
				$project: {
					password: 0,
					secretKey: 0,
					updatedOn: 0,
					token: 0,
					__v: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		]).then((data: any) => {
			return res.status(200).json({
				status: true,
				massage: "Get data succesfully !",
				dataLimit: count,
				data
			})
		}).catch((error: any) => {
			console.log(error)
			return res.status(301).json({
				status: false,
				massage: "Server error ! Data not found !",
				error
			})
		})
	})
		.catch((error: any) => {
			console.log(error)
			return res.status(301).json({
				status: false,
				massage: "Server error ! Data not found !",
				error
			})
		})
}

const changeStatus = (req: Request<any, any, CustomerUpdate>, res: Response<Res>): void => {
	CustomerModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				status: req.body.status
			}
		}
	).then(() => {
		return res.status(200).json({
			status: true,
			massage: "Update customer status succesfully !"

		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

export {
	getCustomr,
	changeStatus
}
