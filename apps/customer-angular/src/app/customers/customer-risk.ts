import type { Customer, CustomerHealth } from './customer.model';

/** Plain-language reasons a customer may churn; an empty list means no warning signs. */
export function riskReasonsFor(customer: Customer): string[] {
  const reasons: string[] = [];
  if (customer.daysSinceLastLogin > 14) reasons.push(`${customer.daysSinceLastLogin} days since last login`);
  if (customer.paymentFailures > 0) reasons.push(`${customer.paymentFailures} recent payment failure(s)`);
  if (customer.unresolvedPriorityTickets > 0) {
    reasons.push(`${customer.unresolvedPriorityTickets} unresolved priority ticket(s)`);
  }
  const utilization = customer.seatsUsed / customer.seatsPurchased;
  if (utilization < 0.5) {
    reasons.push(`only ${customer.seatsUsed} of ${customer.seatsPurchased} seats in use (${Math.round(utilization * 100)}%)`);
  }
  return reasons;
}

export function healthFor(customer: Customer): CustomerHealth {
  const count = riskReasonsFor(customer).length;
  return count === 0 ? 'Healthy' : count === 1 ? 'Needs attention' : 'At risk';
}
