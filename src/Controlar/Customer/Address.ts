import { Request, Response } from "express"
import { CommonParamsType, Res } from "../../lib/DataSet/Common"
import AddressModel from "../../Model/Customer/Address"
import { errorCode } from "../../lib/service/responseCode"
import { AddressRequestType, UpdateAddressRequestType } from "../../lib/DataSet/Customer/Request"
import mongoose from "mongoose"


const getAddress = (req: Request<CommonParamsType>, res: Response<Res>): void => {
	try {

		AddressModel.aggregate([
			{
				$match: {
					customerID: new mongoose.Types.ObjectId(req.params.id)
				}
			},
			{
				$project: {
					customerID: 0,
					__v: 0
				}
			}
		])
			.then(result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Address Data fetched Successfully",
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

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const addAddress = (req: Request<any, any, AddressRequestType>, res: Response<Res>): void => {
	try {

		const address = new AddressModel({...req.body})
		address.save()
			.then(() => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Address Added Successfully"
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

const updateAddress = (req: Request<CommonParamsType, any, UpdateAddressRequestType>, res: Response<Res>): void => {
	try {

		AddressModel.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					...req.body
				}
			}
		)
			.then(result => {
				if(result){
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Address Updated Successfully"
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

const removeAddress = (req: Request<CommonParamsType>, res: Response<Res>): void => {
	try {

		AddressModel.findByIdAndDelete(
			req.params.id
		)
			.then(result => {
				if(result){
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Address Deleted Successfully"
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


const AddressController = {
	getAddress,
	addAddress,
	updateAddress,
	removeAddress
}

export default AddressController