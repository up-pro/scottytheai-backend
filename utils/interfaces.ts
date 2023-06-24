export interface IOkPacket {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}

export interface ITokenAmountInfo {
  id: number;
  claimed_token_amount: number;
  total_token_amount: number;
}

export interface IClaimableTokenOfInvestor {
  id: number;
  investor: string;
  claimable_token_amount: number;
}
