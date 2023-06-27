import { Request, Response } from "express";
import { getCurrentDateTime } from "../utils/functions";
const db = require("../utils/db");

// ------------------------------------------------------------------------------------

const TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE = process.env
  .TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE
  ? Number(process.env.TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE)
  : 0;
const PRESALE_STAGE_NUMBER = process.env.PRESALE_STAGE_NUMBER
  ? Number(process.env.PRESALE_STAGE_NUMBER)
  : 1;

// ------------------------------------------------------------------------------------

export const invest = async (req: Request, res: Response) => {
  const { investor, fundTypeId, fundAmount, tokenAmount } = req.body;
  const currentDateTime = getCurrentDateTime();

  try {
    const invest = (
      await db.query(
        "SELECT * FROM invests WHERE investor = ? AND id_fund_type = ?;",
        [investor, fundTypeId]
      )
    )[0];
    const tokenAmountInfo = (
      await db.query("SELECT * FROM token_amount_infos WHERE id = ?;", [
        PRESALE_STAGE_NUMBER
      ])
    )[0];
    const claimableTokenOfInvestor = (
      await db.query(
        "SELECT * FROM claimable_token_of_investors WHERE investor = ?;",
        [investor]
      )
    )[0];

    /* --------- Handle "invests" and "claimable_token_of_investors" table ------ */
    if (invest) {
      //  If this investor already invested this fund type, update its amount
      await db.query(
        "UPDATE invests SET fund_amount = ?, token_amount = ?, updated_at = ? WHERE investor = ? AND id_fund_type = ?;",
        [
          invest.fund_amount + fundAmount,
          invest.token_amount + tokenAmount,
          currentDateTime,
          investor,
          fundTypeId
        ]
      );
      await db.query(
        "UPDATE claimable_token_of_investors SET claimable_token_amount = ? WHERE investor = ?;",
        [
          claimableTokenOfInvestor.claimable_token_amount + tokenAmount,
          investor
        ]
      );
    } else {
      //  If this investor invests this fund type at first
      await db.query(
        "INSERT INTO invests(investor, id_fund_type, fund_amount, token_amount, created_at) VALUES(?, ?, ?, ?, ?);",
        [investor, fundTypeId, fundAmount, tokenAmount, currentDateTime]
      );

      if (claimableTokenOfInvestor) {
        await db.query(
          "UPDATE claimable_token_of_investors SET claimable_token_amount = ? WHERE investor = ?;",
          [
            claimableTokenOfInvestor.claimable_token_amount + tokenAmount,
            investor
          ]
        );
      } else {
        await db.query(
          "INSERT INTO claimable_token_of_investors(investor, claimable_token_amount) VALUES(?, ?);",
          [investor, tokenAmount]
        );
      }
    }
    /* ---------------------------------------------------------------------------- */

    /* ------------------ Handle "token_amount_infos" table ----------------------- */
    //  Update the claimed token amount
    if (tokenAmountInfo) {
      await db.query(
        "UPDATE token_amount_infos SET claimed_token_amount = ? WHERE id = ?;",
        [
          tokenAmountInfo.claimed_token_amount + tokenAmount,
          PRESALE_STAGE_NUMBER
        ]
      );
    } else {
      await db.query(
        "INSERT INTO token_amount_infos(id, claimed_token_amount, total_token_amount) VALUES(?, ?, ?);",
        [PRESALE_STAGE_NUMBER, tokenAmount, TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE]
      );
    }
    /* ---------------------------------------------------------------------------- */

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
