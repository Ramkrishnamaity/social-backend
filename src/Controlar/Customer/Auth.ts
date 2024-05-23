import { Request, Response } from "express"
import { CommonParamsType, ReqWithAuth, Res } from "../../lib/DataSet/Common/index"
import CustomerModel from "../../Model/Customer/CustomerModel"
import { errorCode } from "../../lib/service/responseCode"
import { CustomerRequestType, ProfileRequestType, UpdateCustomerRequestType } from "../../lib/DataSet/Customer/Request"
import mongoose from "mongoose"
import { CustomerDataType } from "../../lib/DataSet/Customer/Response"
import WalletModel from "../../Model/Common/Wallet"
import PostModel from "../../Model/Customer/PostModel"
import ProductModel from "../../Model/Customer/Product"
import WishlistModel from "../../Model/Customer/Wishlist"

const addCustomer = (req: Request<any, any, CustomerRequestType> & { user?: ReqWithAuth }, res: Response<Res<{ _id?: string }>>): void => {
	try {

		CustomerModel.findOne({ email: req.body.email })
			.then(result => {
				if (!result) {
					const customer = new CustomerModel({ ...req.body, clientID: req.user?._id })
					customer.save()
						.then(async result => {
							await WalletModel.create({ userID: result._id })
							res.status(errorCode.SUCCESS).json({
								status: true,
								message: "Customer Created Succesfully",
								data: { _id: result._id.toString() }
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
					res.status(errorCode.BAD_REQUEST).json({
						status: false,
						message: "Customer Already Exist.."
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

const updateCustomer = (req: Request<any, any, UpdateCustomerRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		CustomerModel.findOneAndUpdate(
			{
				_id: req.params.id,
				clientID: req.user?._id
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
						message: "Customer Updated Succesfully"
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

const getProfile = (req: Request<CommonParamsType, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const customerID = req.header("X-User-Id")
		const limit = 10
		const today = new Date()

		if (!req.query.page) {
			CustomerModel.aggregate([
				{
					$match: {
						_id: new mongoose.Types.ObjectId(req.params.id)
					}
				},
				{
					$lookup: {
						from: "client-posts",
						foreignField: "customerID",
						localField: "_id",
						as: "posts",
						pipeline: [
							{
								$match: {
									status: true,
									isDeleted: false
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
									localField: "postID",
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
								$limit: limit
							},
							{
								$sort: { _id: -1 }
							}
						]
					}
				},
				{
					$project: {
						_id: 1,
						fristName: 1,
						lastName: 1,
						email: 1,
						image: 1,
						posts: 1
					}
				}
			])
				.then(async result => {
					const totalData = await PostModel.countDocuments({ customerID: customerID, status: true, isDeleted: false })
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Customer Profile Fetched Succesfully",
						data: result,
						totalPage: Math.ceil(totalData / limit) - 1
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

			const page: any = req.query.page || 1
			const limit = 10
			const skip = limit * (page - 1)

			PostModel.aggregate([
				{
					$match: {
						customerID: new mongoose.Types.ObjectId(customerID),
						status: true,
						isDeleted: false
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
						localField: "postID",
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
				{ $limit: limit }
			])
				.then(result => {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Customer Post Fetched Succesfully",
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

		}


	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error..!",
			error
		})
	}
}

const updateProfile = (req: Request<CommonParamsType, any, ProfileRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		CustomerModel.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					...req.body,
					updatedOn: new Date()
				}
			}
		)
			.then(() => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Customer Profile Updated Succesfully"
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

const deleteCustomer = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {
		CustomerModel.findOneAndUpdate(
			{
				clientID: req.user?._id,
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
						message: "Customer Deleted Succesfully"
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

const getCustomers = (req: Request<any, any, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const page = req.query.page || 1
		const limit = 10
		const skip = limit * (page - 1)
		CustomerModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req.user?._id),
					isDeleted: false
				}
			},
			{
				$project: {
					clientID: 0,
					isDeleted: 0,
					__v: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		])
			.then(async result => {
				const totalCustomer = await CustomerModel.countDocuments({ clientID: req.user?._id, isDeleted: false })
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Customer Fetched Succesfully",
					data: result as CustomerDataType[],
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


const getCustomerPost = (req: Request<CommonParamsType, any, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const page = req.query.page || 1
		console.log("pase", page)
		const limit = 10
		const skip = (page - 1) * limit
		PostModel.countDocuments({ clientID: req?.user?._id, customerID: req.params.id }).exec().then((count) => {
			PostModel.aggregate([
				{
					$match: {
						clientID: new mongoose.Types.ObjectId(req.user?._id),
						customerID: new mongoose.Types.ObjectId(req.params.id)
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
									userImage: 1
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
					message: "Get data succesfully !",
					totalPage: Math.ceil(count / limit),
					data
				})
			}).catch((error: any) => {
				console.log(error)
				return res.status(301).json({
					status: false,
					message: "Server error ! Data not found !",
					error
				})
			})
		})
			.catch((error: any) => {
				console.log(error)
				return res.status(301).json({
					status: false,
					message: "Server error ! Data not found !",
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


const getCustomerProduct = (req: Request<CommonParamsType, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const page: any = req.query.page || 1
		console.log("pase", page)
		const limit = 10
		const skip = (page - 1) * limit

		const match = {
			clientID: new mongoose.Types.ObjectId(req.user?._id),
			customerID: new mongoose.Types.ObjectId(req.params.id),
			isDeleted: false
		}
		const countMatch = { clientID: req.user?._id, customerID: req.params.id, isDeleted: false }

		// const today = new Date()

		ProductModel.aggregate([
			{
				$match: match
			},
			{
				$lookup: {
					from: "categories",
					foreignField: "_id",
					localField: "categoryID",
					as: "category",
					pipeline: [
						{
							$project: {
								_id: 1,
								name: 1
							}
						}
					]
				}
			},
			{
				$lookup: {
					from: "subcategories",
					foreignField: "_id",
					localField: "subcategoryID",
					as: "subcategory",
					pipeline: [
						{
							$project: {
								_id: 1,
								name: 1,
								image: 1
							}
						}
					]
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
								fristName: 1,
								lastName: 1,
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
				$unwind: {
					path: "$subcategory",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$unwind: {
					path: "$category",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					categoryID: 0,
					subcategoryID: 0,
					customerID: 0,
					clientID: 0,
					isDeleted: 0,
					__v: 0
				}
			},
			{ $skip: skip },
			{ $limit: limit }
		])
			.then(async result => {
				const totalCustomer = await ProductModel.countDocuments(countMatch)
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Product Fetched Succesfully",
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

const mywishList = (req: Request<CommonParamsType, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const customerID = req.header("X-User-Id")
		const today = new Date()
		const limit = 10
		const page: any = req.query.page || 1
		const skip = (page - 1) * limit

		WishlistModel.aggregate([
			{
				$match: {
					customerID: new mongoose.Types.ObjectId(customerID)
				}
			},
			{
				$lookup: {
					from: "client-products",
					localField: "productID",
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
								productName: 1,
								productDesc: 1,
								productMedia: 1,
								price: {
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
				$unwind: "$product"
			},
			{
				$skip: skip
			},
			{
				$limit: limit
			},
			{
				$sort: { _id: -1 }
			}
		])
			.then(async result => {
				const totalData = await WishlistModel.countDocuments({ customerID: customerID })
				console.log(totalData)
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "WishList Fetched Succesfully",
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


const customerWalletHistory = (req: Request<CommonParamsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		WalletModel.aggregate([
			{
				$match: {
					userID: new mongoose.Types.ObjectId(req.params.id),
				}
			},
			{
				$lookup: {
					from: "transactions",
					localField: "userID",
					foreignField: "userID",
					as: "refferal-transaction",
					pipeline: [
						{
							$match: {
								tag: "Affiliate"
							}
						}, 
						{
							$sort: { _id: -1 }
						}
					]
				}
			}
		])
			.then(async result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Customer wallet Fetched Succesfully",
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



const CustomerController = {
	addCustomer,
	mywishList,
	getCustomers,
	deleteCustomer,
	updateCustomer,
	getProfile,
	updateProfile,
	getCustomerPost,
	customerWalletHistory,
	getCustomerProduct
}

export default CustomerController