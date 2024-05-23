import {Request, Response } from "express"
import {  type Res } from "../../lib/DataSet/Global"
import ClientAfflitedPersentageModel from "../../Model/ClientAftlitePersentage"
import mongoose from "mongoose"
import { ReqWithAuth } from "../../lib/DataSet/Common"
import { AffiliateRequestType } from "../../lib/DataSet/Client/Request"

const updateAffititedPersentage = (req: Request<any, any, AffiliateRequestType> & {user?: ReqWithAuth}, res: Response<Res>): void => {
	ClientAfflitedPersentageModel.findOneAndUpdate(
		{
			clientID: new mongoose.Types.ObjectId(req?.user?._id)
		},
		{
			$set: {
				...req.body
			}
		}
	).then(() => {
		return res.status(200).json({
			status: true,
			massage: "Update afflited persentage data succesfully !"
		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const viewPersentage = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	console.log(req.user?._id)
	ClientAfflitedPersentageModel.aggregate([
		{
			$match: {
				clientID: new mongoose.Types.ObjectId(req.user?._id)
			}
		},
		{
			$project: {
				ownPersentage: 1,
				affiliatedPersentage: 1
			}
		},
		{
			$sort: {
				createdOn: -1
			}
		}

	]).then((data: any) => {
		return res.status(200).json({
			status: true,
			massage: "Get data succesfully !",
			// dataLimit: count,
			data: data[0]
		})
	}).catch((error: any) => {
		console.log(error)
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

export {
	updateAffititedPersentage,
	viewPersentage
}
