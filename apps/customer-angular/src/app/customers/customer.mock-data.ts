import type { Customer } from './customer.model';

export const CUSTOMERS = [
  {
    id: 'priya',
    name: 'Priya Nair',
    company: 'Northwind Labs',
    email: 'priya@northwind.example',
    plan: 'Pro',
    annualContractValue: 4800,
    daysSinceLastLogin: 23,
    paymentFailures: 2,
    openTickets: 4,
    unresolvedPriorityTickets: 1,
    seatsUsed: 3,
    seatsPurchased: 10,
  },
  {
    id: 'tom',
    name: 'Tom Becker',
    company: 'Becker & Sons Logistics',
    email: 'tom@becker.example',
    plan: 'Enterprise',
    annualContractValue: 36000,
    daysSinceLastLogin: 1,
    paymentFailures: 0,
    openTickets: 1,
    unresolvedPriorityTickets: 0,
    seatsUsed: 47,
    seatsPurchased: 50,
  },
  {
    id: 'lena',
    name: 'Lena Ortiz',
    company: 'Ortiz Design Studio',
    email: 'lena@ortiz.example',
    plan: 'Starter',
    annualContractValue: 900,
    daysSinceLastLogin: 9,
    paymentFailures: 0,
    openTickets: 2,
    unresolvedPriorityTickets: 0,
    seatsUsed: 1,
    seatsPurchased: 3,
  },
] as const satisfies readonly Customer[];

export type CustomerId = (typeof CUSTOMERS)[number]['id'];

export const CUSTOMER_IDS = CUSTOMERS.map((customer) => customer.id);
