import { Request, Response, NextFunction } from "express"
import * as jwt from "jsonwebtoken"
import { errorCode } from "./responseCode"
import { ReqWithAuth, Res } from "../DataSet/Common"
import ClientModel from "../../Model/Client/ClientModel"


const middleware = (req: Request, res: Response, next: NextFunction): void => {
	if (typeof (req.headers.authorization) === "undefined") {
		res
			.status(200)
			.json({
				error: "No credentials sent!",
				status: false,
				credentials: false
			})
	} else {
		const authorization: any = req.headers.authorization
		const userType =
			typeof req.headers.usertype !== "undefined" ? req.headers.usertype : "User"
		if (userType === "client") {
			const decode: any = jwt.decode(authorization)
			if (typeof (decode) !== "undefined" && decode !== null) {
				(req as any).user = { _id: decode?._id }
				next()
			} else {
				res
					.status(401)
					.json({
						error: "credentials not match",
						status: false,
						credentials: false
					})
			}
		} else if (userType === "admin") {
			const decode: any = jwt.decode(authorization)
			if (typeof (decode) !== "undefined" && decode !== null) {
				(req as any).user = { _id: decode?._id }
				next()
			} else {
				res
					.status(401)
					.json({
						error: "credentials not match",
						status: false,
						credentials: false
					})
			}
		} else {
			res
				.status(401)
				.json({
					error: "credentials not match",
					status: false,
					credentials: false
				})
		}
	}
}

const CustomerMiddleware = (req: Request & { user?: ReqWithAuth }, res: Response<Res>, next: NextFunction): void => {
	try {
		if (!req.header("X-API-KEY")) {

			res.status(errorCode.AUTH_ERROR).json({
				status: false,
				message: "Credentials Not Found..!"
			})

		} else {
			ClientModel.findOne({ apiKey: req.header("X-API-KEY") })
				.then(result => {
					if (!result) {
						res.status(errorCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "Invalid Api Key..!"
						})
					} else {
						req.user = {_id: result._id.toString()}
						next()
					}
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

const CheckSecret = (req: Request & { user?: ReqWithAuth }, res: Response<Res>, next: NextFunction): void => {
	try{

		if(!req.header("X-SECRET-KEY")){

			res.status(errorCode.AUTH_ERROR).json({
				status: false,
				message: "No Credential Sent..!"
			})

		} else{

			ClientModel.findOne(
				{
					secretKey: req.header("X-SECRET-KEY")
				}
			)
				.then(result => {
					if (!result) {
						res.status(errorCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "Invalid Secret Key..!"
						})
					} else {
						req.user = {_id: result._id.toString()}
						next()
					}
				})
				.catch(error => {
					res.status(errorCode.SERVER_ERROR).json({
						status: false,
						message: "Server Error..!",
						error
					})
				})

		}
		
	} catch(error){
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const authZ = {
	middleware,
	CustomerMiddleware,
	CheckSecret
}

export default authZ
