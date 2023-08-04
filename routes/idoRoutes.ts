import express, { Router } from "express";
import {
  claimScotty,
  createSaleStage,
  deleteSaleStage,
  disableSaleStage,
  getAllSaleStages,
  getClaimScottyStatus,
  getClaimableScottyAmountOfInvestor,
  getEnabledSaleStage,
  getInvestedTokenRaised,
  getInvestedTokens,
  getSaleData,
  invest,
  updateClaimStatus,
  updateSaleStage,
  updateStatusOfSaleStage
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
router.post("/claim-scotty", claimScotty);
router.put("/disable-sale-stage/:id", disableSaleStage);

//  Admin
router.put("/update-status-of-sale-stage/:id", updateStatusOfSaleStage);
router.get("/get-all-sale-stages", getAllSaleStages);
router.post("/create-sale-stage", createSaleStage);
router.delete("/delete-sale-stage/:id", deleteSaleStage);
router.put("/update-sale-stage/:id", updateSaleStage);
router.put("/update-claim-status", updateClaimStatus);

module.exports = router;
