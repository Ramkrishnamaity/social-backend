import { Router } from "express"
import { ClientLogin, ClientSignup } from "../../Controlar/Client/Auth"
import authZ from "../../lib/service/middleware"
import ClientRoute from "./Clint"
import AdminRoute from "./Admin"
import CustomerRoute from "./Customer"
import { AdminLogin, AdminSignup } from "../../Controlar/Admin/Auth"
import ClientController from "../../Controlar/Client"
import {confirmSubscription} from "../../Controlar/Admin/Subcription"
const ApiRouter = Router()



ApiRouter.post("/client/signup", ClientSignup)
ApiRouter.post("/client/signin", ClientLogin)

ApiRouter.post("/admin/signup", AdminSignup)
ApiRouter.post("/admin/signin", AdminLogin)

ApiRouter.get("/subscription-success/:planID/:cusID", confirmSubscription)



ApiRouter.put("/client/customer/wallet/:id", authZ.CheckSecret, ClientController.customerWallet)    // ---------------------
ApiRouter.put("/client/customer/order/:id", authZ.CheckSecret, ClientController.confirmStatus)    // ---------------------


ApiRouter.use("/customer", CustomerRoute)

ApiRouter.use(authZ.middleware)


ApiRouter.use("/client", ClientRoute)
ApiRouter.use("/admin", AdminRoute)


// module.exports = router;
export default ApiRouter
