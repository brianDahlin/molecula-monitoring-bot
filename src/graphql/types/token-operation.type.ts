export enum TokenOperationType {
  deposit = 'deposit',
  withdrawal = 'withdrawal',
  swapDeposit = 'swapDeposit',
  swapWithdrawal = 'swapWithdrawal',
  transfer = 'transfer',
}

export interface TokenOperation {
  _id: string;
  transaction: string;
  tokenAddress: string;
  created: number;
  sender: string;
  from: string;
  to: string;
  value: string;
  shares: string;
  type: TokenOperationType;
  details?: {};
}
