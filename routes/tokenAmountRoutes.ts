import express, { Router } from "express";
import { getTokenAmountInfos } from "../controllers/tokenAmountController";

const router: Router = express.Router();

router.get("/get-token-amount-info", getTokenAmountInfos);

module.exports = router;
