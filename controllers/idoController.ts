import { Request, Response } from "express";
import {
  IdoClaimScottyStatus,
  IdoClaimableScottyAmountOfInvestor,
  IdoInvestedToken,
  IdoInvestment,
  IdoSaleStage
} from "../models";
import { ethers } from "ethers";
import {
  CHAIN_ID,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  RPC_URL
} from "../utils/constants";

const OWNER_WALLET = process.env.OWNER_WALLET || "";

/**
 * Invest ETH or USDT to claim SCOTTY
 */
export const invest = async (req: Request, res: Response) => {
  try {
    const {
      investorWalletAddress,
      investedTokenId,
      investedTokenAmount,
      scottyAmount,
      saleStageId
    } = req.body;

    console.log(">>>>>>>> req.body => ", req.body);

    //  The data of current sale stage
    const idoSaleStageData = (
      await IdoSaleStage.findOne({
        where: {
          id: saleStageId
        }
      })
    )?.dataValues;

    if (
      Number(idoSaleStageData.claimed_scotty_amount) >=
      Number(idoSaleStageData.hard_cap)
    ) {
      return res.sendStatus(409);
    }

    if (
      Number(idoSaleStageData.claimed_scotty_amount) + scottyAmount >
      Number(idoSaleStageData.hard_cap)
    ) {
      return res.sendStatus(409);
    }

    //  The data of user's investment in the current sale stage
    const idoInvestmentData = (
      await IdoInvestment.findOne({
        where: {
          investor_wallet_address: investorWalletAddress,
          id_invested_token: investedTokenId,
          id_sale_stage: saleStageId
        }
      })
    )?.dataValues;

    //  The data of claimable scotty amount of user
    const idoClaimableScottyAmountOfInvestorData = (
      await IdoClaimableScottyAmountOfInvestor.findOne({
        where: {
          investor_wallet_address: investorWalletAddress
        }
      })
    )?.dataValues;

    //  Update claimed_scotty_amount adding user's claimed scotty amount
    await IdoSaleStage.update(
      {
        claimed_scotty_amount:
          Number(idoSaleStageData.claimed_scotty_amount) + scottyAmount
      },
      { where: { id: saleStageId } }
    );

    if (idoInvestmentData) {
      //  If user has ever invested same token in the current sale stage

      //  Update invested token amount and scotty amount adding investedTokenAmount and scottyAmount
      await IdoInvestment.update(
        {
          invested_token_amount:
            Number(idoInvestmentData.invested_token_amount) +
            investedTokenAmount,
          scotty_amount: Number(idoInvestmentData.scotty_amount) + scottyAmount
        },
        {
          where: {
            investor_wallet_address: investorWalletAddress,
            id_invested_token: investedTokenId,
            id_sale_stage: saleStageId
          }
        }
      );

      //  Update user's claimable scotty amount adding scottyAmount
      await IdoClaimableScottyAmountOfInvestor.update(
        {
          claimable_scotty_amount:
            Number(
              idoClaimableScottyAmountOfInvestorData.claimable_scotty_amount
            ) + scottyAmount
        },
        {
          where: {
            investor_wallet_address: investorWalletAddress
          }
        }
      );
    } else {
      //  If user is new to invest this token in the current sale stage

      //  Insert user's first investment data
      await IdoInvestment.create({
        investor_wallet_address: investorWalletAddress,
        id_invested_token: investedTokenId,
        invested_token_amount: investedTokenAmount,
        scotty_amount: scottyAmount,
        id_sale_stage: saleStageId
      });

      if (idoClaimableScottyAmountOfInvestorData) {
        //  If user has ever invested any token before, update his claimable scotty amount adding scottyAmount
        await IdoClaimableScottyAmountOfInvestor.update(
          {
            claimable_scotty_amount:
              Number(
                idoClaimableScottyAmountOfInvestorData.claimable_scotty_amount
              ) + scottyAmount
          },
          {
            where: {
              investor_wallet_address: investorWalletAddress
            }
          }
        );
      } else {
        //  If user is new to invest token, insert his new data
        await IdoClaimableScottyAmountOfInvestor.create({
          investor_wallet_address: investorWalletAddress,
          claimable_scotty_amount: scottyAmount
        });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of invest => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get invested tokens
 */
export const getInvestedTokens = async (req: Request, res: Response) => {
  try {
    const investedTokens = await IdoInvestedToken.findAll();
    return res.send(investedTokens);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getInvestedTokens => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get enabled sale stage
 */
export const getEnabledSaleStage = async (req: Request, res: Response) => {
  try {
    const saleStage = await IdoSaleStage.findOne({
      where: { enabled: "true" }
    });
    if (saleStage) {
      return res.send(saleStage);
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getEnabledSaleStage => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get claimable scotty amount of an investor
 */
export const getClaimableScottyAmountOfInvestor = async (
  req: Request,
  res: Response
) => {
  try {
    const { investorWalletAddress } = req.params;
    const idoClaimableScottyAmountData =
      await IdoClaimableScottyAmountOfInvestor.findOne({
        where: { investor_wallet_address: investorWalletAddress }
      });
    return res.send(idoClaimableScottyAmountData);
  } catch (error) {
    console.log(
      ">>>>>>>>>>>>>>> error of getClaimableScottyAmountOfInvestor => ",
      error
    );
    return res.sendStatus(500);
  }
};

/**
 * Claim SCOTTY.
 */
export const claimScotty = async (req: Request, res: Response) => {
  try {
    const { investorWalletAddress, scottyAmount } = req.body;
    const { PRIVATE_KEY_OF_ADMIN_WALLET } = process.env;

    //  Get claimable scotty amount of investor
    const idoClaimableScottyAmountOfInvestorData = (
      await IdoClaimableScottyAmountOfInvestor.findOne({
        where: {
          investor_wallet_address: investorWalletAddress
        }
      })
    )?.dataValues;

    if (idoClaimableScottyAmountOfInvestorData) {
      //  If investor has the permission to claim SCOTTY

      const claimableScottyAmount = Number(
        idoClaimableScottyAmountOfInvestorData
      );

      if (claimableScottyAmount < scottyAmount) {
        //  If scottyAmount is bigger than investor's claimable scotty amount, reponse with 400 error
        return res
          .sendStatus(400)
          .send(`You can claim ${claimableScottyAmount} SCOTTY at max.`);
      } else {
        //  If scottyAmount is smaller than investor's claimable scotty amount

        //  Send SCOTTY to investor's wallet
        const network = ethers.providers.getNetwork(CHAIN_ID);
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL, network);
        const signer = new ethers.Wallet(
          PRIVATE_KEY_OF_ADMIN_WALLET || "",
          provider
        );
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        const tx = await contract.transfer(
          investorWalletAddress,

          ethers.utils.parseEther(`${scottyAmount}`),
          { from: signer.address }
        );
        await tx.wait();

        //  Update investor's claimable scotty amount
        const updatedIdoClaimableScottyAmountOfInvestorData =
          await IdoClaimableScottyAmountOfInvestor.update(
            { claimable_scotty_amount: claimableScottyAmount - scottyAmount },
            { where: { investor_wallet_address: investorWalletAddress } }
          );

        console.log(
          ">>>>>>>>>>>>>> updatedIdoClaimableScottyAmountOfInvestorData => ",
          updatedIdoClaimableScottyAmountOfInvestorData
        );
        return res.send(updatedIdoClaimableScottyAmountOfInvestorData);
      }
    } else {
      return res
        .sendStatus(404)
        .send("You can't claim SCOTTY since you didn't pay any token.");
    }
  } catch (error) {
    console.log(
      ">>>>>>>>>>>>>>> error of getClaimableScottyAmountOfInvestor => ",
      error
    );
    return res.sendStatus(500);
  }
};

/**
 * Get the status of scotty claim
 */
export const getClaimScottyStatus = async (req: Request, res: Response) => {
  try {
    const idoClaimScottyStatusData = await IdoClaimScottyStatus.findOne({
      where: { id: 1 }
    });
    return res.send(idoClaimScottyStatusData);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getClaimScottyStatus => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get invested token raised
 */
export const getInvestedTokenRaised = async (req: Request, res: Response) => {
  try {
    const { investedTokenId } = req.params;

    const raisedAmount = await IdoInvestment.sum("invested_token_amount", {
      where: { id_invested_token: investedTokenId }
    });

    return res.send({ raisedAmount });
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getInvestedTokenRaised => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get sale data
 */
export const getSaleData = async (req: Request, res: Response) => {
  try {
    const { investedTokenId } = req.params;

    const raisedAmount = await IdoInvestment.sum("invested_token_amount", {
      where: { id_invested_token: investedTokenId }
    });
    const enabledSaleStage = await IdoSaleStage.findOne({
      where: { enabled: "true" }
    });
    const claimScottyStatusData = await IdoClaimScottyStatus.findOne({
      where: { id: 1 }
    });

    return res.send({
      raisedAmount,
      enabledSaleStage,
      claimScottyStatusData
    });
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getSaleData => ", error);
    return res.sendStatus(500);
  }
};

/* ---------------------------------------------- Admin --------------------------------------------------- */

/**
 * Enable a sale stage
 */
export const enableSaleStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //  Disable the previous sale stage whose id is enabledStageId
    await IdoSaleStage.update(
      { enabled: "false" },
      { where: { enabled: "true" } }
    );

    //  Enable the sale stage whose id is id.
    await IdoSaleStage.update({ enabled: "true" }, { where: { id } });

    return res.sendStatus(200);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of enableSaleStage => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Update a sale stage
 */
export const updateSaleStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of setPeriodOfSaleStage => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Get all sale stages
 */
export const getAllSaleStages = async (req: Request, res: Response) => {
  try {
    const saleStages = await IdoSaleStage.findAll();
    return res.send(saleStages);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of getAllSaleStages => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Create a new sale stage
 */
export const createSaleStage = async (req: Request, res: Response) => {
  try {
    const { name, scottyPriceInUsd, hardCap, startAt, endAt } = req.body;
    await IdoSaleStage.create({
      name,
      scotty_price_in_usd: scottyPriceInUsd,
      claimed_scotty_amount: 0,
      enabled: "false",
      hard_cap: hardCap,
      start_at: startAt,
      end_at: endAt
    });
    return res.sendStatus(201);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of createSaleStage => ", error);
    return res.sendStatus(500);
  }
};

/**
 * Delete sale stage
 */
export const deleteSaleStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await IdoSaleStage.destroy({ where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    console.log(">>>>>>>>>>>>>>> error of deleteSaleStage => ", error);
    return res.sendStatus(500);
  }
};
