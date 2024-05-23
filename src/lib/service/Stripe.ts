import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")


const createCustomer = async (email: string, name: string) => {

	const customer = await stripe.customers.create({
		email: email,
		name: name
	})
	console.log(customer)
	return customer.id
}

const createProduct = async (PRODUCT_NAME: string) => {
	// const PRODUCT_NAME = "Monthly Subscription";
	// const PRODUCT_TYPE = 'service'

	const product = await stripe.products.create({
		name: PRODUCT_NAME
	})

	console.log(product)
	return product.id
}

const updateProduct = async (PRODUCT_ID: string, PRODUCT_NAME: string) => {
	// const PRODUCT_NAME = "Monthly Subscription";
	// const PRODUCT_TYPE = 'service'

	await stripe.products.update(
		PRODUCT_ID,
		{
			name: PRODUCT_NAME
		}
	)

}

const createPlan = async (productId: string, PLAN_NICKNAME: string, CURRENCY: string, PLAN_INTERVAL: "day" | "week" | "month" | "year", PLAN_PRICE: number) => {
	// const PLAN_NICKNAME = "Monthly Subscription Plan";
	// const interval:string = PLAN_INTERVAL
	// const CURRENCY = "usd";
	// const PLAN_PRICE = 200;

	const plan = await stripe.plans.create({
		product: productId,
		nickname: PLAN_NICKNAME,
		currency: CURRENCY,
		interval: PLAN_INTERVAL,
		amount: PLAN_PRICE * 100,
	})

	console.log(plan)
	return plan.id
}

const deletePlanProduct = async (planID: string, productId: string,) => {
	// const PLAN_NICKNAME = "Monthly Subscription Plan";
	// const interval:string = PLAN_INTERVAL
	// const CURRENCY = "usd";
	// const PLAN_PRICE = 200;

	await stripe.products.del(productId)
	await stripe.plans.del(planID)

}

const upadtePlan = async (PLAN_ID: string, PLAN_NICKNAME: string) => {
	await stripe.plans.update(
		PLAN_ID,
		{
			nickname: PLAN_NICKNAME
		}
	)
}

const subscribeCustomerToPlan = async (customerId: string, planId: string) => {
	// const subscription = await stripe.subscriptions.create({
	// 	customer: customerId,
	// 	items: [{ plan: planId }]
	// })

	const subscription = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customerId,
		line_items: [
			{
				price: planId,
				quantity: 1
			}
		],
		payment_method_types: ["card"],
		// subscription_data: {
		// 	trial_period_days: 10
		// },
		success_url: `http://localhost:8000/api/subscription-success/${planId}/${customerId}`,
		cancel_url: "https://www.google.com/"

	})

	return subscription
}



const StripeUtilityMethods = {
	createCustomer,
	createProduct,
	updateProduct,
	subscribeCustomerToPlan,
	createPlan,
	upadtePlan,
	deletePlanProduct
}

export default StripeUtilityMethods

