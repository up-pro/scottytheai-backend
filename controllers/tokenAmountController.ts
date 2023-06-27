import { Request, Response } from "express";
import { ITokenAmountInfo } from "../utils/interfaces";
const db = require("../utils/db");

// ----------------------------------------------------------------------------------------

const TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE = process.env
  .TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE
  ? Number(process.env.TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE)
  : 0;
const PRESALE_STAGE_NUMBER = process.env.PRESALE_STAGE_NUMBER
  ? Number(process.env.PRESALE_STAGE_NUMBER)
  : 1;

// ----------------------------------------------------------------------------------------

interface IRawDataOfTotalInvestment {
  name: string;
  amount: number;
}

interface ITotalInvestment {
  [key: string]: number;
}

// ----------------------------------------------------------------------------------------

export const getTokenAmountInfos = async (req: Request, res: Response) => {
  try {
    console.log(">>>>>> PRESALE_STAGE_NUMBER => ", PRESALE_STAGE_NUMBER);
    const totalInvestment: ITotalInvestment = {
      ethereum: 0,
      usdt: 0
    };

    const tokenAmountInfo = (
      await db.query("SELECT * FROM token_amount_infos WHERE id = ?;", [
        PRESALE_STAGE_NUMBER
      ])
    )[0];

    // Get Total Investment by crypto type --------------------------------------------------------
    const rawDataOfTotalInvestment: Array<IRawDataOfTotalInvestment> =
      await db.query(`
        SELECT fund_types.name, SUM( invests.fund_amount ) AS amount
        FROM invests LEFT JOIN fund_types ON fund_types.id = invests.id_fund_type 
        GROUP BY fund_types.id;
      `);

    for (let i = 0; i < rawDataOfTotalInvestment.length; i += 1) {
      totalInvestment[rawDataOfTotalInvestment[i].name.toLowerCase()] =
        rawDataOfTotalInvestment[i].amount;
    }

    console.log(">>>>>> totalInvestment => ", totalInvestment);

    //  Register token amount ----------------------------------------------------------------------
    if (!tokenAmountInfo) {
      await db.query(
        "INSERT INTO token_amount_infos(id, claimed_token_amount, total_token_amount) VALUES(?, ?, ?);",
        [PRESALE_STAGE_NUMBER, 0, TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE]
      );

      return res.send({
        tokenAmountInfo: {
          id: PRESALE_STAGE_NUMBER,
          claimed_token_amount: 0,
          total_token_amount: TOTAL_TOKEN_AMOUNT_OF_CURRENT_STAGE
        },
        totalInvestment
      });
    }

    return res.send({ tokenAmountInfo, totalInvestment });
  } catch (error) {
    console.log(">>>>>>>> error of getTokenAmountInfos => ", error);
    return res.sendStatus(500);
  }
};
