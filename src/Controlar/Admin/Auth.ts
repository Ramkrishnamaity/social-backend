import { type Request, type Response } from "express"
import { type AdminAuth, type LoginRes } from "../../lib/DataSet/AdminAuth"
import { type Res } from "../../lib/DataSet/Global"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import AdminModel from "../../Model/AdminModel"

function createToken(data: any): string {
	return jwt.sign(data, "admintoken")
}

const AdminSignup = (req: Request<any, any, AdminAuth>, res: Response<Res<LoginRes>>): void => {
	const _id = new mongoose.Types.ObjectId()
	const token = createToken({ _id, userType: "admin" })
	bcrypt.hash(req.body.password, 10).then((password) => {
		const dataSet = new AdminModel({ ...req.body, _id, token, password })
		dataSet.save().then((data) => {
			res.status(200).json({
				status: true,
				massage: "client signup succesfull",
				data: {
					token: data.token,
					userImage: data.userImage,
					fristName: data.fristName,
					lastName: data.lastName
				}
			})
		})
			.catch((error) => {
				return res.status(301).json({
					status: false,
					error,
					massage: "Server error. Please try again."
				})
			})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			error,
			massage: "Server error. Please try again."
		})
	})
}

const AdminLogin = (req: Request<any, any, AdminAuth>, res: Response<Res<LoginRes>>): any => {
	const { email, password } = req.body

	AdminModel.findOne({ email })
		.then(async (data: any) => {
			console.log("data", data)
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
					return res.status(200).json({
						status: true,
						massage: "Login succesfully !",
						data: {
							token: data.token,
							userImage: data.userImage,
							fristName: data.fristName,
							lastName: data.lastName
						}
					})
				}
			}
		}).catch((error) => {
			console.log("err", error)
		})
}

export {
	AdminSignup,
	AdminLogin
}
