import { type Request, type Response } from "express"
import { type Res } from "../../lib/DataSet/Global"
import SubcriptionModel from "./../../Model/SubcriptionModel"
// import { type ResSubcription, type SubcriptionDataSet } from "../../lib/DataSet/Subcripton"
import { PlanRequestType, SubscriptionRequetsType } from "../../lib/DataSet/Client/Request"
import StripeUtilityMethods from "../../lib/service/Stripe"
import { ReqWithAuth } from "../../lib/DataSet/Common"
import { errorCode } from "../../lib/service/responseCode"
import PlanModel from "../../Model/Common/Plan"
import ClientModel from "../../Model/Client/ClientModel"



const viewSubcriptionPlan = (req: Request & { user?: ReqWithAuth }, res: Response<Res>): void => {

	try {

		PlanModel.aggregate([
			{
				$match: {
					isDeleted: false
				}
			},
			{
				$sort: { _id: -1 }
			}
		])
			.then(async (result) => {

				res.status(errorCode.SUCCESS).json({
					status: true,
					massage: "Plan Fetched Successfully.",
					data: result
				})

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					massage: "Server Error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			massage: "Server Error..!",
			error
		})
	}
}

const updateSubcriptionPlan = (req: Request<{id: string}, any, PlanRequestType> & {user?: ReqWithAuth}, res: Response<Res>): void => {
	PlanModel.findByIdAndUpdate(
		req.params.id,
		{
			$set: {
				...req.body
			}
		},
		{
			new: true
		}
	).then(async (result) => {

		if(!result){
			res.status(404).json({
				status: false,
				massage: "Invalid data. !"
			})
		} else{
			//update on stripe
			await StripeUtilityMethods.updateProduct(result.productID, req.body.PRODUCT_NAME)
			await StripeUtilityMethods.upadtePlan(result.planID, req.body.PLAN_NICKNAME)
	
			res.status(200).json({
				status: true,
				massage: "Update subcription data succesfully !"
			})
		}

	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const createSubcriptionPlan = (req: Request<any, any, SubscriptionRequetsType> & { user?: ReqWithAuth }, res: Response<Res>): void => {

	try {

		const {
			PRODUCT_NAME,
			PLAN_NICKNAME,
			PLAN_INTERVAL,
			PLAN_PRICE,
			CURRENCY
		} = req.body

		PlanModel.create({
			name: PRODUCT_NAME,
			description: PLAN_NICKNAME,
			price: PLAN_PRICE,
			currency: CURRENCY,
			interval: PLAN_INTERVAL
		})
			.then(async (plan) => {

				const productID = await StripeUtilityMethods.createProduct(req.body.PRODUCT_NAME)
				const planID = await StripeUtilityMethods.createPlan(productID, req.body.PLAN_NICKNAME, req.body.CURRENCY, req.body.PLAN_INTERVAL, req.body.PLAN_PRICE)
				plan.addPlanIDProductID(planID, productID)
				res.status(errorCode.SUCCESS).json({
					status: true,
					massage: "Plan added Successfully."
				})

			})
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					massage: "Server Error..!",
					error
				})
			})

	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			massage: "Server Error..!",
			error
		})
	}
}

const deleteSubcriptionPlan = (req: Request<{id: string}> & {user?: ReqWithAuth}, res: Response<Res>): void => {
	PlanModel.findByIdAndDelete(
		req.params.id
	).then(async (result) => {

		if(!result){
			res.status(404).json({
				status: false,
				massage: "Invalid data. !"
			})
		} else{
		//update on stripe
			await StripeUtilityMethods.deletePlanProduct(result.planID, result.productID)

			res.status(200).json({
				status: true,
				massage: "Delete subcription succesfully !"
			})
		}
		
	}).catch((error) => {
		return res.status(301).json({
			status: false,
			massage: "Server error ! Data not found !",
			error
		})
	})
}

const buySubcription = (req: Request<{id: string}> & { user?: ReqWithAuth }, res: Response<Res>): void => {

	try {

		ClientModel.findById(req.user?._id)
			.then(async result => {
				const subscription = await StripeUtilityMethods.subscribeCustomerToPlan(result.customerID, req.params.id)
				res.status(errorCode.SUCCESS).json({
					status: true,
					massage: "Payment Url .",
					data: subscription
				})
			})
		
			.catch(error => {
				res.status(errorCode.SERVER_ERROR).json({
					status: false,
					massage: "Server Error..!",
					error
				})
			})


	} catch (error) {
		res.status(errorCode.SERVER_ERROR).json({
			status: false,
			massage: "Server Error..!",
			error
		})
	}
}

const confirmSubscription = (req: Request<{planID: string, cusID: string}>, res: Response): void => {
	try{

		ClientModel.findOne(
			{
				customerID: req.params.cusID
			}
		)
			.then(async client => {
				const plan = await PlanModel.findOne({
					planID: req.params.planID
				})

				await SubcriptionModel.create({
					customerID: req.params.cusID,
					clientID: client._id,
					planID: plan._id
				})
				res.redirect("http://localhost:8000/")
			
			})
			.catch(error => {
				console.log(error)
				res.redirect("https://www.google.com/")
			})

	} catch(error){
		console.log(error)
		res.redirect("https://www.google.com/")
	}
}

export {
	createSubcriptionPlan,
	viewSubcriptionPlan,
	updateSubcriptionPlan,
	deleteSubcriptionPlan,
	buySubcription,
	confirmSubscription
}
