import { type Request, type Response } from "express"
import { ReqUser, type RequestClient, type Res } from "../../lib/DataSet/Global"
import SubCategoryModel from "./../../Model/SubCategoryModel"
import mongoose from "mongoose"
import { type ResSubCategory, type SubCategoryDataSet } from "../../lib/DataSet/SubCategory"
import ClientCategoryModel from "../../Model/Client/ClientCategory"
import { errorCode } from "../../lib/service/responseCode"

const createSubCategory = (req: Request<SubCategoryDataSet> & {user?: ReqUser}, res: Response<Res<ResSubCategory>>): void => {
	const dataSet = new SubCategoryModel({ ...req.body })
	dataSet.save().then(async (data) => {
		await data.linkUser(req.user?._id ?? "")

		res.status(200).json({
			status: true,
			massage: "Sub category added succesfully !",
			data: {
				name: data.name,
				description: data.description,
				image: data.image
			}
		})
	}).catch((error) => {
		res.status(301).json({
			status: false,
			error,
			massage: "Server error. Please try again."
		})
	})
}

const viewSubCategory = (req: RequestClient, res: Response<Res>): void => {
	const page = 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit

	ClientCategoryModel.findOne(
		{
			userID: req.user?._id
		}
	)
		.then(data => {
			if (data === null) {
				res.status(200).json({
					status: true,
					massage: "Get data succesfully !",
					dataLimit: 0,
					data: []
				})
			} else {
				SubCategoryModel.countDocuments({
					_id: {
						$in: data.subcategories
					},
					status: true,
					isDeleted: false
				}).exec().then((count) => {
					SubCategoryModel.aggregate([
						{
							$match: {
								_id: {
									$in: data.subcategories
								},
								status: true,
								isDeleted: false
							}
						},
						{
							$lookup: {
								from: "categories",
								localField: "categoryID",
								foreignField: "_id",
								as: "categoryData",
								pipeline: [
									{
										$project: {
											name: 1,
											description: 1
											// image: 1
										}
									}
								]
							}
						},
						{
							$unwind: "$categoryData"
						},
						{
							$lookup: {
								from: "client-products",
								pipeline: [
									{
										$match: {
											isDeleted: false,
											status: true
										}
									}
								],
								localField: "_id",
								foreignField: "subcategoryID",
								as: "productList"
							}
						},
						{
							$addFields: {
								productCount: { $size: "$productList" }
							}
						},
						{
							$project: {
								password: 0,
								secretKey: 0,
								// createdOn: 0,
								updatedOn: 0,
								modifiedOn: 0,
								isDeleted: 0,
								categoryID: 0,
								__v: 0,
								productList: 0
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

const viewCatSubCat = (req: RequestClient, res: Response<Res>): void => {
	try{

		SubCategoryModel.aggregate([
			{
				$match: {
					categoryID: new mongoose.Types.ObjectId(req.params.id),
					status: true,
					isDeleted: false
				}
			},
			{
				$project: {
					_id: 1,
					name: 1
				}
			},
			{
				$sort: {_id: -1}
			}
		])
			.then(result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					massage: "sub category fetched succesfully !",
					data: result
				})
			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					massage: "Server error ! Data not found !",
					error
				})
			})


	} catch(error){
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	}
}

const updateSubCategory = (req: RequestClient, res: Response<Res<ResSubCategory>>): void => {
	SubCategoryModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				...req.body
			}
		}
	).then(() => {
		res.status(200).json({
			status: true,
			massage: "Update sub category data succesfully !"
		})
	}).catch((error) => {
		res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const deleteSubCategory = (req: RequestClient, res: Response<Res<ResSubCategory>>): void => {
	SubCategoryModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				isDeleted: true
			}
		}
	).then(async (data) => {
		await data?.linkUser(req.user?._id ?? "")
		res.status(200).json({
			status: true,
			massage: "sub category Deleted succesfully !"
		})
	}).catch((error) => {
		res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

export {
	createSubCategory,
	viewSubCategory,
	updateSubCategory,
	deleteSubCategory,
	viewCatSubCat
}
