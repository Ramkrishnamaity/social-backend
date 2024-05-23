import ClientModel from "../../Model/Client/ClientModel"
import { Request, Response } from "express"
import { CommonParamsType, ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import OrderModel from "../../Model/Customer/Order"
import WalletModel from "../../Model/Common/Wallet"
import { CustomerWalletRequestType } from "../../lib/DataSet/Client/Request"



const getSecretKey = (req: Request & {user?: ReqWithAuth}, res: Response<Res<string>>): void => {
	try{

		ClientModel.findById(req.user?._id)
			.then(result => {
				if(result){
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Secret Key Fetched Succesfully.",
						data: result.secretKey
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

	} catch(error){
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const customerWallet = (req: Request<CommonParamsType, any, CustomerWalletRequestType> & {user?: ReqWithAuth}, res: Response<Res<string>>): void => {
	try{

		WalletModel.findOne(
			{
				userID: req.params.id
			}
		)
			.then(async result => {

				if(!result){
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Invalid Data..!"
					})
				} else{
					if(req.body.isAdd){
						await result.credit(req.body.amount, "Add Balance", req.body.transactionID)
					} else{
						await result.debit(req.body.amount, "Withdraw Balance", req.body.transactionID)
					}
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Transaction Added..!"
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
		
	} catch(error){
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const confirmStatus = (req: Request<CommonParamsType> & {user?: ReqWithAuth}, res: Response<Res<string>>): void => {
	try{

		OrderModel.findById(req.params.id)
			.then(async (result: any)=> {
				if(!result){
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Invalid Data..!"
					})
				} else{
					await result.changeStatus("Confirmed", false)
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Order Confirmed."
					})
				}
			})
			.catch(error => {
				res.status(errorCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "Invalid Data..!",
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


const ClientController = {
	getSecretKey,
	customerWallet,
	confirmStatus
}

export default ClientController