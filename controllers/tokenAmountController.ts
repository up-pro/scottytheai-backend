import { Request, Response } from "express";
import { ITokenAmountInfo } from "../utils/interfaces";
const db = require("../utils/db");

export const getTokenAmountInfos = (req: Request, res: Response) => {
  db.query("SELECT * FROM token_amount_infos WHERE id = 1;")
    .then((results: Array<ITokenAmountInfo>) => {
      return res.json(results[0]);
    })
    .catch((error: Error) => {
      return res.sendStatus(500);
    });
};
