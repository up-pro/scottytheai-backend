import express, { Router } from "express";
import {
  enableSaleStage,
  getClaimScottyStatus,
  getClaimableScottyAmountOfInvestor,
  getEnabledSaleStage,
  getInvestedTokenRaised,
  getInvestedTokens,
  getSaleData,
  invest
} from "../controllers/idoController";

const router: Router = express.Router();

router.post("/invest", invest);
router.get("/get-invested-tokens", getInvestedTokens);
router.get("/get-enabled-sale-stage", getEnabledSaleStage);
router.get(
  "/get-claimable-scotty-amount-of-investor/:investorWalletAddress",
  getClaimableScottyAmountOfInvestor
);
router.get("/get-claim-scotty-status", getClaimScottyStatus);
router.get(
  "/get-invested-token-raised/:investedTokenId",
  getInvestedTokenRaised
);
router.get("/get-sale-data/:investedTokenId", getSaleData);

//  Admin
router.put("/enable-sale-stage/:id", enableSaleStage);

module.exports = router;
