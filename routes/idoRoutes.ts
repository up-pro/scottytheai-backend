import express, { Router } from "express";
import {
  createSaleStage,
  deleteSaleStage,
  enableSaleStage,
  getAllSaleStages,
  getClaimScottyStatus,
  getClaimableScottyAmountOfInvestor,
  getEnabledSaleStage,
  getInvestedTokenRaised,
  getInvestedTokens,
  getSaleData,
  invest,
  updateSaleStage
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
router.get("/get-all-sale-stages", getAllSaleStages);
router.post("/create-sale-stage", createSaleStage);
router.delete("/delete-sale-stage/:id", deleteSaleStage);
router.put("/update-sale-stage/:id", updateSaleStage);

module.exports = router;
