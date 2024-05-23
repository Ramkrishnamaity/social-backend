"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Client_1 = require("../../Controlar/Admin/Client");
const Subcription_1 = require("../../Controlar/Admin/Subcription");
const ApiRouter = (0, express_1.Router)();
ApiRouter.get("/client/:page", Client_1.getClient);
ApiRouter.put("/client/status/:id", Client_1.changeStatus);
// ApiRouter.put('/client/up', changeDelStatus)
ApiRouter.post("/subcription", Subcription_1.createSubcriptionPlan);
ApiRouter.get("/subcription", Subcription_1.viewSubcriptionPlan);
ApiRouter.put("/subcription/:id", Subcription_1.updateSubcriptionPlan);
ApiRouter.delete("/subcription/:id", Subcription_1.deleteSubcriptionPlan);
exports.default = ApiRouter;
