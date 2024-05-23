import {Request, Response } from "express"
import { type CategoryDataSet, type ResCategory } from "../../lib/DataSet/Category"
import { ReqUser, type RequestClient, type Res } from "../../lib/DataSet/Global"
import CategoryModel from "./../../Model/CategoryModel"
import mongoose from "mongoose"
import ClientCategoryModel from "../../Model/Client/ClientCategory"
import { ReqWithAuth } from "../../lib/DataSet/Common"

const create = (req: Request<any, any, CategoryDataSet> & { user?: ReqUser }, res: Response<Res<ResCategory>>): void => {
	const dataSet = new CategoryModel({ ...req.body })
	dataSet.save().then(async (data) => {
		await data.linkUser(req.user?._id ?? "")
		res.status(200).json({
			status: true,
			massage: "Category added succesfully !",
			data: {
				name: data.name,
				description: data.description
			}
		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			error,
			massage: "Server error. Please try again."
		})
	})
}

const viewCategory = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
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
				CategoryModel.countDocuments(
					{
						_id: {
							$in: data.categories
						},
						status: true,
						isDeleted: false
					})
					.exec()
					.then((count) => {
						CategoryModel.aggregate([
							{
								$match: {
									_id: {
										$in: data.categories
									},
									status: true,
									isDeleted: false
								}
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
									foreignField: "categoryID",
									as: "categoryData"
								}
							},
							{
								$addFields: {
									productCount: { $size: "$categoryData" }
								}
							},
							{
								$project: {
									password: 0,
									secretKey: 0,
									updatedOn: 0,
									modifiedOn: 0,
									isDeleted: 0,
									__v: 0,
									categoryData: 0,
									image: 0

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
					}).catch((error: any) => {
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

const viewAllCategory = (req: RequestClient, res: Response<Res>): void => {
	CategoryModel.aggregate([
		{
			$match: {
				isDeleted: false
			}
		},
		{
			$project: {
				name: 1
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
}

const updateCategory = (req: RequestClient, res: Response<Res<ResCategory>>): void => {
	CategoryModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				...req.body

			}
		}
	).then(() => {
		return res.status(200).json({
			status: true,
			massage: "Update category data succesfully !"
		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const deleteCategory = (req: RequestClient, res: Response<Res<ResCategory>>): void => {
	CategoryModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				isDeleted: true
			}
		}
	).then(async (data) => {
		if (data !== null) await data.unLinkUser(req.user?._id ?? "")

		return res.status(200).json({
			status: true,
			massage: "Category Deleted Succesfully !"
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
	create,
	viewCategory,
	updateCategory,
	viewAllCategory,
	deleteCategory
}
