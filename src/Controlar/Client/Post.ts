import type { Request, Response } from "express"
import { type Res } from "../../lib/DataSet/Global"
import PostModel from "../../Model/Customer/PostModel"
import mongoose from "mongoose"
import PostCommentModel from "../../Model/PostCommentModel"
import PostProductModel from "../../Model/PostProduct"

import { type postDataSet } from "../../lib/DataSet/Post"
import PostLikeModel from "../../Model/PostLikeModel"
import { type postCommentDataSet } from "../../lib/DataSet/postComment"
import PostReportModel from "../../Model/PostReportModel"
import { ReqWithAuth } from "../../lib/DataSet/Common"
// import { CustomerUpdate } from '../../lib/DataSet/CustomerAuth';

const getPost = (req:  Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostModel.countDocuments({ clientID: new mongoose.Types.ObjectId(req?.user?._id) }).exec().then((count) => {
		PostModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req?.user?._id)
				}
			},
			{
				$lookup: {
					from: "client-post-reports",
					localField: "_id",
					foreignField: "postID",
					as: "reportList"
				}
			},
			{
				$addFields: {
					reportsCount: { $size: "$reportList" }
				}
			},
			{
				$lookup: {
					from: "client-post-comments",
					localField: "_id",
					foreignField: "postID",
					as: "commentList"
				}
			},
			{
				$addFields: {
					commentsCount: { $size: "$commentList" }
				}
			},
			{
				$lookup: {
					from: "client-post-likes",
					localField: "_id",
					foreignField: "postID",
					as: "likeList"
				}
			},
			{
				$addFields: {
					likeCount: { $size: "$likeList" }
				}
			},
			{
				$lookup: {
					from: "customers",
					pipeline: [
						{
							$project: {
								email: 1,
								fristName: 1,
								lastName: 1,
								image: 1
							}
						}
					],
					localField: "customerID",
					foreignField: "_id",
					as: "customerData"
				}
			},
			{
				$unwind: "$customerData"
			},

			{
				$project: {
					password: 0,
					updatedOn: 0,
					token: 0,
					clientID: 0,
					customerID: 0,
					reportList: 0,
					commentList: 0,
					likeList: 0,
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
			console.log("Error",error)
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

const getPostComment = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostCommentModel.countDocuments({ postID: new mongoose.Types.ObjectId(req?.params?.postID) }).exec().then((count) => {
		PostCommentModel.aggregate([
			{
				$match: {
					postID: new mongoose.Types.ObjectId(req?.params?.postID)
				}
			},
			{
				$lookup: {
					from: "customers",
					pipeline: [
						{
							$project: {
								email: 1,
								fristName: 1,
								lastName: 1,
								image: 1,
								status: 1
							}
						}
					],
					localField: "customerID",
					foreignField: "_id",
					as: "customerData"
				}
			},
			{
				$unwind: "$customerData"
			},
			{
				$project: {
					password: 0,
					updatedOn: 0,
					token: 0,
					clientID: 0,
					customerID: 0,
					reportList: 0,
					commentList: 0,
					likeList: 0,
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

const changePostStatus = (req: Request<any, any, postDataSet>, res: Response<Res>): void => {
	PostModel.findOneAndUpdate(
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

const getPostLike = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostLikeModel.countDocuments({ postID: new mongoose.Types.ObjectId(req?.params?.postID) }).exec().then((count) => {
		PostLikeModel.aggregate([
			{
				$match: {
					postID: new mongoose.Types.ObjectId(req?.params?.postID)
				}
			},
			{
				$lookup: {
					from: "customers",
					pipeline: [
						{
							$project: {
								email: 1,
								fristName: 1,
								lastName: 1,
								image: 1,
								status: 1
							}
						}
					],
					localField: "customerID",
					foreignField: "_id",
					as: "customerData"
				}
			},
			{
				$unwind: "$customerData"
			},
			{
				$project: {
					password: 0,
					updatedOn: 0,
					token: 0,
					clientID: 0,
					customerID: 0,
					reportList: 0,
					commentList: 0,
					likeList: 0,
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

const changeCommentStatus = (req: Request<any, any, postCommentDataSet>, res: Response<Res>): void => {
	PostCommentModel.findOneAndUpdate(
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
			massage: "Update comment status succesfully !"

		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const deletePostComment = (req: Request<any, any, postCommentDataSet>, res: Response<Res>): void => {
	PostCommentModel.deleteOne(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		}

	).then(() => {
		return res.status(200).json({
			status: true,
			massage: "Deleted comment status succesfully !"

		})
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const getPostReport = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostReportModel.countDocuments({ postID: new mongoose.Types.ObjectId(req?.params?.postID) }).exec().then((count) => {
		PostReportModel.aggregate([
			{
				$match: {
					postID: new mongoose.Types.ObjectId(req?.params?.postID)
				}
			},
			{
				$lookup: {
					from: "customers",
					pipeline: [
						{
							$project: {
								email: 1,
								fristName: 1,
								lastName: 1,
								image: 1,
								status: 1
							}
						}
					],
					localField: "customerID",
					foreignField: "_id",
					as: "customerData"
				}
			},
			{
				$unwind: "$customerData"
			},
			{
				$project: {
					password: 0,
					updatedOn: 0,
					token: 0,
					clientID: 0,
					customerID: 0,
					reportList: 0,
					commentList: 0,
					likeList: 0,
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

const getReportPost = (req: Request & {user?: ReqWithAuth}, res: Response): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostModel.countDocuments({ clientID: new mongoose.Types.ObjectId(req?.user?._id) }).exec().then(() => {
		PostModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req?.user?._id)
				}
			},
			{
				$lookup: {
					from: "client-post-reports",
					foreignField: "postID",
					localField: "_id",
					as: "reports"
				}
			},
			{
				$addFields: {
					reportsCount: {
						$size: "$reports"
					}
				}
			},
			{
				$unwind: "$reports"
			},
			{
				$lookup: {
					from: "client-post-comments",
					localField: "_id",
					foreignField: "postID",
					as: "commentList"
				}
			},
			{
				$addFields: {
					commentsCount: { $size: "$commentList" }
				}
			},
			{
				$lookup: {
					from: "client-post-likes",
					localField: "_id",
					foreignField: "postID",
					as: "likeList"
				}
			},
			{
				$addFields: {
					likeCount: { $size: "$likeList" }
				}
			},
			// {
			// 	$lookup: {
			// 		from: "client-post-reports",
			// 		localField: "_id",
			// 		foreignField: "postID",
			// 		as: "reportList",
			// 		// pipeline: [

			// 		// 	{
			// 		// 		$lookup: {
			// 		// 			from: "customers",
			// 		// 			pipeline: [
			// 		// 				{
			// 		// 					$project: {
			// 		// 						email: 1,
			// 		// 						fristName: 1,
			// 		// 						lastName: 1,
			// 		// 						userImage: 1
			// 		// 					}
			// 		// 				}
			// 		// 			],
			// 		// 			localField: "customerID",
			// 		// 			foreignField: "_id",
			// 		// 			as: "reportedCustomerData"
			// 		// 		}
			// 		// 	},
			// 		// 	{
			// 		// 		$unwind: "$reportedCustomerData"
			// 		// 	},
			// 		// 	{
			// 		// 		$project: {
			// 		// 			title: 1,
			// 		// 			note: 1,
			// 		// 			customerID: 1

			// 		// 		}
			// 		// 	}
			// 		// ]
			// 	}
			// },
			// {
			// 	$unwind: "$reportList"
			// },
			{
				$lookup: {
					from: "customers",
					pipeline: [
						{
							$project: {
								email: 1,
								fristName: 1,
								lastName: 1,
								image: 1
							}
						}
					],
					localField: "customerID",
					foreignField: "_id",
					as: "customerData"
				}
			},
			{
				$unwind: "$customerData"
			},

			{
				$project: {
					likeList: 0,
					reports: 0,
					commentList: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		]).then((data: any) => {
			return res.status(200).json({
				status: true,
				massage: "Get data succesfully !",
				dataLimit: data.length,
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

const getUserProduct = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostProductModel.countDocuments({ customerID: new mongoose.Types.ObjectId(req?.params?.id), isDeleted: false }).exec().then((count) => {
		PostProductModel.aggregate([
			{
				$match: {
					customerID: new mongoose.Types.ObjectId(req?.params?.id),
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
					from: "subcategories",
					localField: "subCategoryID",
					foreignField: "_id",
					as: "subSategoryData",
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
				$unwind: "$subSategoryData"
			},

			{
				$project: {
					isDeleted: 0,
					createdOn: 0,
					modifiedOn: 0,
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

const getAllProduct = (req: Request & {user?: ReqWithAuth}, res: Response<Res>): void => {
	const page = parseInt(req.params.page) ?? 1
	console.log("pase", page)
	const limit = 10
	const skip = (page - 1) * limit
	PostProductModel.countDocuments({ isDeleted: false }).exec().then((count) => {
		PostProductModel.aggregate([
			{
				$match: {
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
					from: "customers",
					localField: "customerID",
					foreignField: "_id",
					as: "customersData",
					pipeline: [
						{
							$project: {
								fristName: 1,
								lastName: 1,
								image: 1,
								email: 1
							}
						}
					]
				}
			},

			{
				$unwind: "$customersData"
			},
			{
				$lookup: {
					from: "subcategories",
					localField: "subCategoryID",
					foreignField: "_id",
					as: "subSategoryData",
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
				$unwind: "$subSategoryData"
			},

			{
				$project: {
					isDeleted: 0,
					createdOn: 0,
					modifiedOn: 0,
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

const changeProductStatus = (req: Request<any, any, postCommentDataSet>, res: Response<Res>): void => {
	PostProductModel.findOneAndUpdate(
		{
			_id: new mongoose.Types.ObjectId(req.params.id)
		},
		{
			$set: {
				enableStatus: req.body.status
			}
		}
	).then(() => {
		return res.status(200).json({
			status: true,
			massage: "Update product status succesfully !"

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
	getPost,
	getPostComment,
	changePostStatus,
	getPostLike,
	changeCommentStatus,
	deletePostComment,
	getPostReport,
	getReportPost,
	getUserProduct,
	getAllProduct,
	changeProductStatus
}
