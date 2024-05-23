"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default((_a = process.env.STRIPE_SECRET_KEY) !== null && _a !== void 0 ? _a : "");
const createCustomer = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield stripe.customers.create({
        email: email,
        name: name
    });
    console.log(customer);
    return customer.id;
});
const createProduct = (PRODUCT_NAME) => __awaiter(void 0, void 0, void 0, function* () {
    // const PRODUCT_NAME = "Monthly Subscription";
    // const PRODUCT_TYPE = 'service'
    const product = yield stripe.products.create({
        name: PRODUCT_NAME
    });
    console.log(product);
    return product.id;
});
const updateProduct = (PRODUCT_ID, PRODUCT_NAME) => __awaiter(void 0, void 0, void 0, function* () {
    // const PRODUCT_NAME = "Monthly Subscription";
    // const PRODUCT_TYPE = 'service'
    yield stripe.products.update(PRODUCT_ID, {
        name: PRODUCT_NAME
    });
});
const createPlan = (productId, PLAN_NICKNAME, CURRENCY, PLAN_INTERVAL, PLAN_PRICE) => __awaiter(void 0, void 0, void 0, function* () {
    // const PLAN_NICKNAME = "Monthly Subscription Plan";
    // const interval:string = PLAN_INTERVAL
    // const CURRENCY = "usd";
    // const PLAN_PRICE = 200;
    const plan = yield stripe.plans.create({
        product: productId,
        nickname: PLAN_NICKNAME,
        currency: CURRENCY,
        interval: PLAN_INTERVAL,
        amount: PLAN_PRICE * 100,
    });
    console.log(plan);
    return plan.id;
});
const deletePlanProduct = (planID, productId) => __awaiter(void 0, void 0, void 0, function* () {
    // const PLAN_NICKNAME = "Monthly Subscription Plan";
    // const interval:string = PLAN_INTERVAL
    // const CURRENCY = "usd";
    // const PLAN_PRICE = 200;
    yield stripe.products.del(productId);
    yield stripe.plans.del(planID);
});
const upadtePlan = (PLAN_ID, PLAN_NICKNAME) => __awaiter(void 0, void 0, void 0, function* () {
    yield stripe.plans.update(PLAN_ID, {
        nickname: PLAN_NICKNAME
    });
});
const subscribeCustomerToPlan = (customerId, planId) => __awaiter(void 0, void 0, void 0, function* () {
    // const subscription = await stripe.subscriptions.create({
    // 	customer: customerId,
    // 	items: [{ plan: planId }]
    // })
    const subscription = yield stripe.checkout.sessions.create({
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
    });
    return subscription;
});
const StripeUtilityMethods = {
    createCustomer,
    createProduct,
    updateProduct,
    subscribeCustomerToPlan,
    createPlan,
    upadtePlan,
    deletePlanProduct
};
exports.default = StripeUtilityMethods;
