import { Router } from "express"
import { changeStatus, getClient } from "../../Controlar/Admin/Client"
import { createSubcriptionPlan, viewSubcriptionPlan, updateSubcriptionPlan , deleteSubcriptionPlan} from "../../Controlar/Admin/Subcription"

const ApiRouter = Router()

ApiRouter.get("/client/:page", getClient)
ApiRouter.put("/client/status/:id", changeStatus)
// ApiRouter.put('/client/up', changeDelStatus)

ApiRouter.post("/subcription", createSubcriptionPlan)
ApiRouter.get("/subcription", viewSubcriptionPlan)
ApiRouter.put("/subcription/:id", updateSubcriptionPlan)
ApiRouter.delete("/subcription/:id", deleteSubcriptionPlan)

export default ApiRouter
