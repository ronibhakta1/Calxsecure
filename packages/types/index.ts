
export interface Balance {
  amount: number;
  locked: number;
}

export interface OnRampTransaction {
  time: Date;
  amount: number;
  status: 'Success' | 'Failure' | 'Processing';
  provider: string;
}

export interface AddMoneyProps {
  onSuccess?: () => void;
}