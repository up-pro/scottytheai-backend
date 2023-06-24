import express, { Router } from "express";
import {
  getClaimableTokenAmount,
  distributeToken
} from "../controllers/distributeController";

const router: Router = express.Router();

router.get("/get-claimable-token-amount/:investor", getClaimableTokenAmount);
router.put("/distribute-token/:id", distributeToken);

module.exports = router;
