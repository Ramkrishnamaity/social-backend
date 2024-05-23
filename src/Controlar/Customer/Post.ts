import { Request, Response } from "express"
import { CommonParamsType, PostShareParamsType, ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import { CommentRequestType, LikeRequestType, PostRequestType, ReportModelType, UpdateCommentRequestType, UpdatePostRequestType } from "../../lib/DataSet/Customer/Request"
import PostModel from "../../Model/Customer/PostModel"
import mongoose, { Types } from "mongoose"
import PostLikeModel from "../../Model/PostLikeModel"
import PostCommentModel from "../../Model/PostCommentModel"
import PostReportModel from "../../Model/PostReportModel"
// import WalletModel from "../../Model/Common/Wallet"
import PostShareModel from "../../Model/Customer/PostShare"


const createPost = (req: Request<any, any, PostRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const post = new PostModel({ ...req.body, clientID: req.user?._id })
		post.save()
			.then(() => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Post Created Successfully."
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

const updatePost = (req: Request<{ id: string }, any, UpdatePostRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		PostModel.findOneAndUpdate(
			{
				_id: req.params.id
			},
			{
				$set: {
					...req.body,
					updatedOn: new Date()
				}
			}
		)
			.then(result => {
				if (result) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Post Created Successfully."
					})
				} else {
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

const deletePost = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		PostModel.findByIdAndUpdate(
			{
				_id: req.params.id
			},
			{
				$set: {
					isDeleted: true
				}
			}
		)
			.then(result => {
				if (result) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Post Deleted Successfully."
					})
				} else {
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

const getPosts = (req: Request<any, any, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const customerID = req.header("X-User-Id")
		const page = req.query.page || 1
		const limit = 10
		const today = new Date()
		const skip = limit * (page - 1)
		PostModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req.user?._id),
					status: true,
					isDeleted: false,
					visibility: "public"
				}
			},
			{
				$lookup: {
					from: "customers",
					localField: "customerID",
					foreignField: "_id",
					as: "customer",
					pipeline: [
						{
							$project: {
								email: 1,
								image: 1,
								fristName: 1,
								lastName: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$customer",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "client-post-likes",
					localField: "_id",
					foreignField: "postID",
					as: "likes"
				}
			},
			{
				$lookup: {
					from: "client-post-comments",
					localField: "_id",
					foreignField: "postID",
					as: "comments"
				}
			},
			{
				$lookup: {
					from: "client-products",
					localField: "products",
					foreignField: "_id",
					as: "product",
					pipeline: [
						{
							$match: {
								isDeleted: false,
								status: true
							}
						},
						{
							$project: {
								_id: 1,
								productName: 1,
								productMedia: 1,
								sellingPrice: {
									$cond: {
										if: {
											$and: [
												{ $ifNull: ["$discount", false] },
												{ $gte: [today, "$discount.startDate"] },
												{ $lte: [today, "$discount.endDate"] }
											]
										},
										then: {
											$multiply: [
												"$price",
												{
													$divide: [
														{
															$subtract: [100, "$discount.percentage"]
														},
														100
													]
												}
											]
										},
										else: "$price"
									}
								}
							}
						}
					]
				}
			},
			{
				$addFields: {
					isLiked: {
						$cond: {
							if: {
								$eq: [
									{ $indexOfArray: ["$likes.customerID", new mongoose.Types.ObjectId(customerID)] },
									-1
								]
							},
							then: false,
							else: true
						}
					},
					like: {
						$size: "$likes"
					},
					comment: {
						$size: "$comments"
					}
				}
			},
			{
				$project: {
					clientID: 0,
					customerID: 0,
					products: 0,
					likes: 0,
					comments: 0,
					isDeleted: 0,
					__v: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit },
			{
				$sort: { _id: -1 }
			}
		])
			.then(async result => {
				const totalCustomer = await PostModel.countDocuments({
					clientID: req.user?._id,
					visibility: "public", status: true, isDeleted: false
				})
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Post Data Fetched Succesfully",
					data: result,
					totalPage: Math.ceil(totalCustomer / limit)
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

const getSearchPosts = (req: Request<any, any, any, { value: string }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const customerID = req.header("X-User-Id")
		const searchParameter = req.query.value
		console.log(searchParameter)
		const today = new Date()
		PostModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req.user?._id),
					status: true,
					isDeleted: false,
					visibility: "public"
				}
			},
			{
				$lookup: {
					from: "customers",
					localField: "customerID",
					foreignField: "_id",
					as: "customer",
					pipeline: [
						{
							$project: {
								email: 1,
								image: 1,
								fristName: 1,
								lastName: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$customer",
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$match: {
					$or: [
						{ "customer.fristName": { $regex: new RegExp(searchParameter, "gi") } },
						{ "customer.lastName": { $regex: new RegExp(searchParameter, "gi") } },
						{ postTitle: { $regex: new RegExp(searchParameter, "gi") } }
					]
				}
			},
			{
				$lookup: {
					from: "client-post-likes",
					localField: "_id",
					foreignField: "postID",
					as: "likes"
				}
			},
			{
				$lookup: {
					from: "client-post-comments",
					localField: "_id",
					foreignField: "postID",
					as: "comments"
				}
			},
			{
				$lookup: {
					from: "client-products",
					localField: "products",
					foreignField: "_id",
					as: "product",
					pipeline: [
						{
							$match: {
								isDeleted: false,
								status: true
							}
						},
						{
							$project: {
								_id: 1,
								productName: 1,
								productMedia: 1,
								sellingPrice: {
									$cond: {
										if: {
											$and: [
												{ $ifNull: ["$discount", false] },
												{ $gte: [today, "$discount.startDate"] },
												{ $lte: [today, "$discount.endDate"] }
											]
										},
										then: {
											$multiply: [
												"$price",
												{
													$divide: [
														{
															$subtract: [100, "$discount.percentage"]
														},
														100
													]
												}
											]
										},
										else: "$price"
									}
								}
							}
						}
					]
				}
			},
			{
				$addFields: {
					isLiked: {
						$cond: {
							if: {
								$eq: [
									{ $indexOfArray: ["$likes.customerID", new mongoose.Types.ObjectId(customerID)] },
									-1
								]
							},
							then: false,
							else: true
						}
					},
					like: {
						$size: "$likes"
					},
					comment: {
						$size: "$comments"
					}
				}
			},
			{
				$project: {
					clientID: 0,
					customerID: 0,
					products: 0,
					likes: 0,
					comments: 0,
					isDeleted: 0,
					__v: 0
				}
			},
			{
				$sort: { _id: -1 }
			}
		])
			.then(async result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Post Data Fetched Succesfully",
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

const getComment = (req: Request<CommonParamsType, any, { page?: number }>, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const page: any = req.query.page || 1
		const limit = 10
		const skip = limit * (page - 1)

		PostCommentModel.aggregate([
			{
				$match: {
					postID: new mongoose.Types.ObjectId(req.params.id),
					status: true
				}
			},
			{
				$lookup: {
					from: "customers",
					foreignField: "_id",
					localField: "customerID",
					as: "customer",
					pipeline: [
						{
							$project: {
								_id: 1,
								fristName: 1,
								lastName: 1,
								email: 1,
								image: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$customer",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					_id: 1,
					customer: 1,
					createdOn: 1,
					comment: 1
				}
			},
			{ $skip: skip },
			{ $limit: limit },
			{
				$sort: { _id: -1 }
			}
		])
			.then(async result => {
				const totalData = await PostCommentModel.countDocuments({ postID: req.params.id })
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Comment Data Fetched Succesfully",
					data: result,
					totalPage: Math.ceil(totalData / limit)
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

const getSinglePost = (req: Request<{ id: string }, any, any> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		const { id } = req.params
		const today = new Date()
		const customerID = req.header("X-User-Id")

		PostModel.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(id)
				}
			},
			{
				$lookup: {
					from: "customers",
					localField: "customerID",
					foreignField: "_id",
					as: "customer",
					pipeline: [
						{
							$project: {
								email: 1,
								image: 1,
								fristName: 1,
								lastName: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$customer",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "client-post-likes",
					localField: "_id",
					foreignField: "postID",
					as: "likes"
				}
			},
			{
				$lookup: {
					from: "client-post-comments",
					localField: "_id",
					foreignField: "postID",
					as: "comments"
				}
			},
			{
				$lookup: {
					from: "client-products",
					localField: "products",
					foreignField: "_id",
					as: "product",
					pipeline: [
						{
							$match: {
								isDeleted: false,
								status: true
							}
						},
						{
							$project: {
								_id: 1,
								productName: 1,
								productMedia: 1,
								sellingPrice: {
									$cond: {
										if: {
											$and: [
												{ $ifNull: ["$discount", false] },
												{ $gte: [today, "$discount.startDate"] },
												{ $lte: [today, "$discount.endDate"] }
											]
										},
										then: {
											$multiply: [
												"$price",
												{
													$divide: [
														{
															$subtract: [100, "$discount.percentage"]
														},
														100
													]
												}
											]
										},
										else: "$price"
									}
								}
							}
						}
					]
				}
			},
			{
				$addFields: {
					isLiked: {
						$cond: {
							if: {
								$eq: [
									{ $indexOfArray: ["$likes.customerID", new mongoose.Types.ObjectId(customerID)] },
									-1
								]
							},
							then: false,
							else: true
						}
					},
					like: {
						$size: "$likes"
					},
					comment: {
						$size: "$comments"
					},
				}
			},
			{
				$project: {
					clientID: 0,
					customerID: 0,
					products: 0,
					likes: 0,
					comments: 0,
					isDeleted: 0,
					__v: 0
				}
			}
		])
			.then(async result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Post Data Fetched Succesfully",
					data: result[0]
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

const likePost = (req: Request<CommonParamsType, any, LikeRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		if (req.body.like) {

			const likeDoc = new PostLikeModel({ customerID: req.body.customerID, postID: req.params.id })
			likeDoc.save()
				.then(() => {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Post Liked Successfully."
					})
				})
				.catch(error => {
					res.status(errorCode.SERVER_ERROR).json({
						status: false,
						message: "Server Error..!",
						error
					})
				})

		} else {

			PostLikeModel.findOneAndDelete(
				{
					customerID: req.body.customerID,
					postID: req.params.id
				}
			)
				.then(result => {
					if (result) {
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "Post Like Removed Successfully."
						})
					} else {
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

		}

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const addComment = (req: Request<any, any, CommentRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const comment = new PostCommentModel({ ...req.body })
		comment.save()
			.then(() => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Comment Added Successfully."
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

const updateComment = (req: Request<CommonParamsType, any, UpdateCommentRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		PostCommentModel.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					...req.body
				}
			}
		)
			.then((result) => {
				if (result) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Comment Updated Successfully."
					})
				} else {
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

const deleteComment = (req: Request<CommonParamsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		PostCommentModel.findByIdAndDelete(
			req.params.id
		)
			.then(result => {
				if (result) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Comment Deleted Successfully."
					})
				} else {
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

const addReport = (req: Request<CommonParamsType, any, ReportModelType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const report = new PostReportModel({ ...req.body })
		report.save()
			.then(result => {
				if (result) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Report Addded Successfully."
					})
				} else {
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

const doShare = (req: Request<PostShareParamsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {

	try {

		const { postID, userID } = req.params
		const referedUserID = req.header("X-User-Id")

		if (referedUserID === userID.toString()) {
			res.status(errorCode.SUCCESS).json({
				status: true,
				message: "Same user use link.."
			})
		} else {
			PostShareModel.aggregate([
				{
					$match: {
						postID: new mongoose.Types.ObjectId(postID),
						$or: [
							{
								reffererID: new mongoose.Types.ObjectId(userID)
							},
							{
								$expr: {
									$in: [new mongoose.Types.ObjectId(userID), "$refferedUserID"]
								}
							},
							{
								$expr: {
									$in: [new mongoose.Types.ObjectId(referedUserID), "$refferedUserID"]
								}
							}
						]
					}
				},
				{
					$lookup: {
						from: "client-posts",
						foreignField: "_id",
						localField: "postID",
						as: "post",
						pipeline: [
							{
								$project: {
									customerID: 1
								}
							}
						]
					}
				},
				{
					$unwind: "$post"
				},
				{
					$sort: { _id: -1 }
				}
			])
				.then(async result => {
					if (result.length !== 0) {

						if (result[0].post.customerID === userID || result[0].post.customerID === referedUserID) {

							res.status(errorCode.SUCCESS).json({
								status: true,
								message: "Chain not Created."
							})

						} else {
							if (result[result.length - 1].refferedUserID.some((id: Types.ObjectId) => id.equals(referedUserID))) {

								res.status(errorCode.SUCCESS).json({
									status: true,
									message: "Already Reffered..!"
								})

							} else {
								const index = result[0].refferedUserID.findIndex((id: Types.ObjectId) => id.equals(userID))

								if (index !== -1) {

									if (referedUserID !== result[0].reffererID) {

										if (index === result[0].refferedUserID.length - 1) {

											result[0].refferedUserID.push(new mongoose.Types.ObjectId(referedUserID))
											await PostShareModel.findByIdAndUpdate(
												result[0]._id,
												{
													$set: {
														refferedUserID: result[0].refferedUserID
													}
												}
											)
											res.status(errorCode.SUCCESS).json({
												status: true,
												message: "Chain Updated Successfully."
											})

										} else {

											const updatedRefferedUserID = result[0].refferedUserID.slice(0, index + 1)
											updatedRefferedUserID.push(new mongoose.Types.ObjectId(referedUserID))
											await PostShareModel.create({
												postID: result[0].postID,
												reffererID: result[0].reffererID,
												refferedUserID: updatedRefferedUserID
											})
											res.status(errorCode.SUCCESS).json({
												status: true,
												message: "Chain Created Successfully."
											})

										}

									} else {

										res.status(errorCode.SUCCESS).json({
											status: true,
											message: "Already Reffered..!"
										})

									}

								} else {
									console.log("Case ---")
									await PostShareModel.create({
										postID: result[0].postID,
										reffererID: result[0].reffererID,
										refferedUserID: [referedUserID]
									})
									res.status(errorCode.SUCCESS).json({
										status: true,
										message: "Chain Created Successfully."
									})

								}

							}
						}

					} else {

						const postshare = new PostShareModel({ postID, reffererID: userID, refferedUserID: [referedUserID] })
						postshare.save()
							.then(() => {
								res.status(errorCode.SUCCESS).json({
									status: true,
									message: "Chain Created Successfully."
								})
							})
							.catch(error => {
								res.status(errorCode.SERVER_ERROR).json({
									status: false,
									message: "Chain Created Successfully.",
									error
								})
							})
					}
				})
				.catch(error => {
					console.log(error)
					res.status(errorCode.SERVER_ERROR).json({
						status: false,
						message: "Server Error..!",
						error
					})
				})
		}

	} catch (error) {
		console.log("error", error)
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}


const PostController = {
	createPost,
	updatePost,
	deletePost,
	getPosts,
	getSearchPosts,
	likePost,
	getComment,
	addComment,
	updateComment,
	deleteComment,
	addReport,
	doShare,
	getSinglePost
}

export default PostController

