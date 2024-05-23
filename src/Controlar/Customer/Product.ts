import ProductModel from "../../Model/Customer/Product"
import { Request, Response } from "express"
import { CommonParamsType, ReqWithAuth, Res } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import { CheckoutRequestType, ProductRequestType, UpdateProductDiscountRequestType, UpdateProductRequestType, WishlistRequestType } from "../../lib/DataSet/Customer/Request"
import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import OrderModel from "../../Model/Customer/Order"
import distributeRefferalBonus from "../../lib/service/Utility"
import WishlistModel from "../../Model/Customer/Wishlist"
import WalletModel from "../../Model/Common/Wallet"
import TransactionModel from "../../Model/Common/Transaction"
// import WalletModel from "../../Model/Common/Wallet"

const createProduct = (req: Request<any, any, ProductRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const Product = new ProductModel({ ...req.body, clientID: req.user?._id })
		Product.save()
			.then(() => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Product Created Successfully."
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

const updateProduct = (req: Request<{ id: string }, any, UpdateProductRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		ProductModel.findOneAndUpdate(
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
						message: "Product Updated Successfully."
					})
				} else {
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Product Not Found."
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

const deleteProduct = (req: Request<{ id: string }> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		ProductModel.findByIdAndUpdate(
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
						message: "Product Deleted Successfully."
					})
				} else {
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Product Not Found."
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

const addDiscount = (req: Request<{ id: string }, any, UpdateProductDiscountRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		ProductModel.findOneAndUpdate(
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
						message: "Discount Added Successfully."
					})
				} else {
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Product Not Found."
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

const getProducts = (req: Request<any, any, any, { page?: number }> & { user?: ReqWithAuth }, res: Response<Res & { totalPage?: number }>): void => {
	try {

		const page = req.query.page || 1
		const limit = 12
		const skip = limit * (page - 1)
		const today = new Date()
		let match = {}
		let countMatch = {}

		if (req.header("X-User-Id")) {
			match = {
				clientID: new mongoose.Types.ObjectId(req.user?._id),
				customerID: new mongoose.Types.ObjectId(req.header("X-User-Id")),
				status: true,
				isDeleted: false
			}
			countMatch = { clientID: req.user?._id, customerID: req.header("X-User-Id"), isDeleted: false }
		} else {
			match = {
				clientID: new mongoose.Types.ObjectId(req.user?._id),
				isDeleted: false
			}
			countMatch = { clientID: req.user?._id, isDeleted: false }
		}
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
				$addFields: {
					discount: {
						$cond: {
							if: {
								$and: [
									{ $ifNull: ["$discount", false] },
									{ $gte: [today, "$discount.startDate"] },
									{ $lte: [today, "$discount.endDate"] }
								]
							},
							then: "$discount.percentage",
							else: 0
						}
					},
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

const getTopProducts = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		TransactionModel.aggregate([
			{
				$match: {
					userID: new mongoose.Types.ObjectId(req.user?._id),
					tag: "Product Sell"
				}
			},
			{
				$group: {
					_id: "$productID"
				}
			},
			{
				$lookup: {
					from: "orders",
					localField: "_id", 
					foreignField: "product._id", 
					as: "orders"
				}
			},
			{
				$lookup: {
					from: "client-products",
					localField: "_id", // Use _id from the previous group stage
					foreignField: "_id", // Assuming productID in orders collection
					as: "product",
					pipeline: [
						{
							$lookup: {
								from: "customers",
								localField: "customerID", // Use _id from the previous group stage
								foreignField: "_id", // Assuming productID in orders collection
								as: "vendor",
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
							$unwind: {
								path: "$vendor",
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$project: {
								productName: 1,
								vendor: 1
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$product",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$addFields: {
					totalOrderQuantity: {
						$sum: "$orders.product.quantity"
					},
					totalOrderAmount: {
						$sum: {
							$map: {
								input: "$orders",
								as: "order",
								in: {
									$multiply: ["$$order.product.quantity", "$$order.product.purchasePrice"]
								}
							}
						}
					}
				}
			},
			{
				$project: {
					orders: 0,
				}
			},
			{
				$sort: { totalOrderAmount: -1 }
			},
			{
				$limit: 10
			}
		])
			.then(result => {

				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Top 10 product fetched.",
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

const getSingleProduct = (req: Request<CommonParamsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const today = new Date()
		const customerID = req.header("X-User-Id")
		console.log(customerID)
		ProductModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req.user?._id),
					_id: new mongoose.Types.ObjectId(req.params.id),
					isDeleted: false
				}
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
				$lookup: {
					from: "wishlists",
					foreignField: "productID",
					localField: "_id",
					as: "wishlist"
				}
			},
			{
				$addFields: {
					isWishListed: {
						$cond: {
							if: {
								$eq: [
									{ $indexOfArray: ["$wishlist.customerID", new mongoose.Types.ObjectId(customerID)] },
									-1
								]
							},
							then: false,
							else: true
						}
					},
					discount: {
						$cond: {
							if: {
								$and: [
									{ $ifNull: ["$discount", false] },
									{ $gte: [today, "$discount.startDate"] },
									{ $lte: [today, "$discount.endDate"] }
								]
							},
							then: "$discount.percentage",
							else: 0
						}
					},
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
			},
			{
				$project: {
					categoryID: 0,
					subcategoryID: 0,
					customerID: 0,
					wishlist: 0,
					clientID: 0,
					isDeleted: 0,
					__v: 0
				}
			}
		])
			.then(async result => {
				res.status(errorCode.SUCCESS).json({
					status: true,
					message: "Product Fetched Succesfully",
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

const getSpecificProduct = (req: Request<CommonParamsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const today = new Date()

		ProductModel.aggregate([
			{
				$match: {
					clientID: new mongoose.Types.ObjectId(req.user?._id),
					_id: new mongoose.Types.ObjectId(req.params.id),
					isDeleted: false
				}
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
								email: 1,
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
				$lookup: {
					from: "orders",
					foreignField: "product._id",
					localField: "_id",
					as: "orders",
					pipeline: [
						{
							$lookup: {
								from: "customers",
								localField: "customerID",
								foreignField: "_id",
								as: "customer",
								pipeline: [
									{
										$project: {
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
								orderID: 1,
								customer: 1,
								paymentMode: 1,
								product: 1,
								createdOn: 1,
								orderStatus: {
									$arrayElemAt: [
										"$orderStatus",
										{
											$subtract: [
												{ $size: "$orderStatus" },
												1
											]
										}
									]
								}
							}
						}
					]
				}
			},
			{
				$addFields: {
					discount: {
						$cond: {
							if: {
								$and: [
									{ $ifNull: ["$discount", false] },
									{ $gte: [today, "$discount.startDate"] },
									{ $lte: [today, "$discount.endDate"] }
								]
							},
							then: "$discount.percentage",
							else: 0
						}
					},
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
					},
					orderCount: {
						$size: "$orders"
					}
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
			}
		])
			.then(async result => {
				if (result.length > 0) {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Product Fetched Succesfully",
						data: result[0]
					})
				} else {
					res.status(errorCode.NOT_FOUND_ERROR).json({
						status: false,
						message: "Invaild Data..!"
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

const productCheckout = (req: Request<any, any, CheckoutRequestType> & { user?: ReqWithAuth }, res: Response<Res>): void => {
	try {

		const orderID = uuidv4()
		const today = new Date()

		ProductModel.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(req.body.productID)
				}
			},
			{
				$lookup: {
					from: "addresses",
					as: "address",
					pipeline: [
						{
							$match: {
								_id: new mongoose.Types.ObjectId(req.body.addressID)
							}
						},
						{
							$project: {
								_id: 0,
								__v: 0,
								customerID: 0
							}
						}
					]
				}
			},
			{
				$unwind: {
					path: "$address",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$addFields: {
					discount: {
						$cond: {
							if: {
								$and: [
									{ $ifNull: ["$discount", false] },
									{ $gte: [today, "$discount.startDate"] },
									{ $lte: [today, "$discount.endDate"] }
								]
							},
							then: "$discount.percentage",
							else: 0
						}
					},
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
		])
			.then(async result => {

				if (req.body.quantity > result[0].stock) {

					res.status(errorCode.BAD_REQUEST).json({
						status: false,
						message: "Stock Limit Exceeded."
					})

				} else {
					const customerBalance = await WalletModel.findOne({ userID: req.body.customerID })
					if (req.body.paymentMode === "Wallet") {

						if (!customerBalance) {
							return res.status(errorCode.NOT_FOUND_ERROR).json({
								status: false,
								message: "Invalid Data..!"
							})
						} else if (customerBalance.balance < (result[0].sellingPrice* Number(req.body.quantity))) {
							return res.status(errorCode.BAD_REQUEST).json({
								status: false,
								message: "Insufficient Balance.!"
							})
						}

					}

					const orderData = {
						orderID,
						customerID: req.body.customerID,
						postID: req.body.postID,
						vendorID: result[0].customerID,
						product: {
							_id: result[0]._id,
							price: result[0].price,
							purchasePrice: result[0].sellingPrice,
							discount: result[0].discount,
							quantity: Number(req.body.quantity)
						},
						address: result[0].address,
						orderStatus:
							req.body.paymentMode === "COD" ? [
								{ status: "Confirmed" },
								{ status: "Delivered" }
							] : [
								{ status: "Pending" }
							],
						paymentMode: req.body.paymentMode
					}

					if (req.body.paymentMode === "Wallet") {
						await customerBalance?.debit((result[0].sellingPrice* Number(req.body.quantity)), "Product Buy", orderID, result[0]._id)
						orderData.orderStatus.push({ status: "Confirmed" })
					}

					const order = new OrderModel(orderData)
					order.save()
						.then(async (order) => {
							const product = await ProductModel.findById(result[0]._id)
							if (orderData.orderStatus[orderData.orderStatus.length - 1].status !== "Pending") {
								// update stock
								product?.updateStock(false, Number(req.body.quantity))
							}

							if (orderData.orderStatus[orderData.orderStatus.length - 1].status === "Delivered") {
								await distributeRefferalBonus(
									orderData.orderID,
									product?.customerID.toString() ?? "",
									req.user?._id ?? "",
									req.body.postID,
									req.body.productID,
									req.body.customerID,
									(result[0].sellingPrice * Number(req.body.quantity)),
									orderData.paymentMode
								)
							}

							res.status(errorCode.SUCCESS).json({
								status: true,
								message: "Order Created.",
								data: order._id
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

const addWishList = (req: Request<CommonParamsType, any, WishlistRequestType>, res: Response<Res>) => {
	try {

		if (req.body.wishlist) {

			const wishListDoc = new WishlistModel({ customerID: req.body.customerID, postID: req.body.postID, productID: req.params.id })
			wishListDoc.save()
				.then(() => {
					res.status(errorCode.SUCCESS).json({
						status: true,
						message: "Post Wishlisted Successfully."
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

			WishlistModel.findOneAndDelete(
				{
					customerID: req.body.customerID,
					productID: req.params.id
				}
			)
				.then(result => {
					if (result) {
						res.status(errorCode.SUCCESS).json({
							status: true,
							message: "Post Wishlist Removed Successfully."
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


const ProductController = {
	createProduct,
	updateProduct,
	deleteProduct,
	addDiscount,
	getProducts,
	getTopProducts,
	getSingleProduct,
	getSpecificProduct,
	productCheckout,
	addWishList
}

export default ProductController