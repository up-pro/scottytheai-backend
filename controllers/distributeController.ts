import { Request, Response } from "express";
import { ethers } from "ethers";
import { IClaimableTokenOfInvestor } from "../utils/interfaces";
import {
  CHAIN_ID,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  RPC_URL
} from "../utils/constants";
const db = require("../utils/db");

//  Get claimable token amount of an investor
export const getClaimableTokenAmount = (req: Request, res: Response) => {
  const { investor } = req.params;
  db.query("SELECT * FROM claimable_token_of_investors WHERE investor = ?;", [
    investor
  ])
    .then((results: Array<IClaimableTokenOfInvestor>) => {
      if (results.length < 0) {
        return res.sendStatus(404);
      }
      return res.json(results[0]);
    })
    .catch((error: Error) => {
      return res.sendStatus(500);
    });
};

//  Update the claimable token amount of an investor
export const distributeToken = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { investor, amount } = req.body;
  const { PRIVATE_KEY_OF_ADMIN_WALLET } = process.env;

  try {
    const claimableTokenOfInvestor = (
      await db.query(
        "SELECT * FROM claimable_token_of_investors WHERE id = ?;",
        [id]
      )
    )[0];

    if (claimableTokenOfInvestor) {
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
        investor,

        ethers.utils.parseEther(`${amount}`),
        { from: signer.address }
      );
      await tx.wait();

      const updatedClaimableTokenAmount =
        claimableTokenOfInvestor.claimable_token_amount - amount;
      await db.query(
        "UPDATE claimable_token_of_investors SET claimable_token_amount = ? WHERE id = ?;",
        [updatedClaimableTokenAmount, id]
      );
      return res.json(updatedClaimableTokenAmount);
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.log('>>>>>>> error => ', error)
    return res.sendStatus(500);
  }
};