export type CustomerPlan = 'Starter' | 'Pro' | 'Enterprise';
export type CustomerHealth = 'Healthy' | 'Needs attention' | 'At risk';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: CustomerPlan;
  annualContractValue: number;
  daysSinceLastLogin: number;
  paymentFailures: number;
  openTickets: number;
  unresolvedPriorityTickets: number;
  seatsUsed: number;
  seatsPurchased: number;
}
