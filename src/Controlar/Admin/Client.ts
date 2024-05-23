import type { Request, Response } from "express"
import { type RequestClient, type Res } from "../../lib/DataSet/Global"
import ClientModel from "../../Model/Client/ClientModel"
import mongoose from "mongoose"
import { type ClientUpdate } from "../../lib/DataSet/ClientAuth"

const getClient = (req: RequestClient, res: Response<Res>): void => {
	const page = 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	ClientModel.countDocuments({ isDeleted: false }).exec().then((count) => {
		// const count = (await CustomerModel.find({ clientID: new mongoose.Types.ObjectId(req?.user?._id) }).exec()).length
		// console.log(cou)
		ClientModel.aggregate([
			{
				$match: {
					isDeleted: false
				}
			},
			{
				$project: {
					password: 0,
					secretKey: 0,
					// createdOn: 0,
					updatedOn: 0,
					token: 0,
					__v: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit },
			{
				$sort: {
					createdOn: -1
				}
			}

		]).then((data: any) => {
			res.status(200).json({
				status: true,
				massage: "Get data succesfully !",
				dataLimit: count,
				data
			})
		}).catch((error: any) => {
			console.log(error)
			res.status(301).json({
				status: false,
				massage: "Server error ! Data not found !",
				error
			})
		})
	})
		.catch((error: any) => {
			console.log(error)
			res.status(301).json({
				status: false,
				massage: "Server error ! Data not found !",
				error
			})
		})
}

const changeStatus = (req: Request<any, any, ClientUpdate>, res: Response<Res>): void => {
	ClientModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				status: req.body.status
			}
		}
	).then(() => {
		res.status(200).json({
			status: true,
			massage: "Update client status succesfully !"

		})
	}).catch((error) => {
		res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

// const changeDelStatus = (req: Request<any, any, ClientUpdate>, res: Response<Res>): void => {
//     ClientModel.updateMany(
//         {},
//         // {
//         //     _id: new mongoose.Types.ObjectId(req.params.id)
//         // },
//         // {
//         //     $set: {
//         //         status: req.body.status
//         //     }
//         // }
//         { $set: { "status": true } },
//         { multi: true }
//     ).then((data) => {
//         return res.status(200).json({
//             status: true,
//             massage: 'Update succesfully !',

//         });

//     }).catch((error) => {
//         return res.status(301).json({
//             status: false,
//             massage: 'Server error ! Data not found !',
//             error
//         });
//     })
// }

export {
	getClient,
	changeStatus
	// changeDelStatus
}
