import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideExperimentalWebMcpTools,
} from '@angular/core';
import { healthFor } from './customers/customer-risk';
import { CUSTOMER_IDS, CUSTOMERS, type CustomerId } from './customers/customer.mock-data';
import { CustomerStore } from './customers/customer.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Every execute() runs in the injection context: the tools read the same CustomerStore the
    // screen renders, so switching customers changes what the agent gets back.
    provideExperimentalWebMcpTools([
      {
        name: 'list_customers',
        description: 'Lists every customer account with its id, plan and health. Use the id with select_customer.',
        inputSchema: { type: 'object', properties: {} },
        execute: () =>
          CUSTOMERS.map((c) => `${c.id}: ${c.name} (${c.company}) — ${c.plan}, ${healthFor(c)}`).join('\n'),
      },
      {
        name: 'select_customer',
        description: 'Opens a customer account on screen. The other tools then answer about this customer.',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', enum: CUSTOMER_IDS, description: 'The id from list_customers.' },
          },
          required: ['customerId'],
          additionalProperties: false,
        },
        execute: ({ customerId }) => {
          if (!CUSTOMER_IDS.includes(customerId as CustomerId)) {
            throw new Error(`Unknown customer "${customerId}". Valid ids: ${CUSTOMER_IDS.join(', ')}.`);
          }
          const store = inject(CustomerStore);
          store.select(customerId as CustomerId);
          return `Now viewing ${store.customer().name} (${store.customer().company}).`;
        },
      },
      {
        name: 'get_current_customer_summary',
        description: 'Summarizes the customer account currently shown on screen.',
        inputSchema: { type: 'object', properties: {} },
        execute: () => {
          const store = inject(CustomerStore);
          const c = store.customer();
          return [
            `Name: ${c.name}`,
            `Company: ${c.company}`,
            `Email: ${c.email}`,
            `Plan: ${c.plan} ($${c.annualContractValue.toLocaleString('en-US')}/year)`,
            `Health: ${store.health()}`,
            `Last login: ${c.daysSinceLastLogin} day(s) ago`,
            `Open tickets: ${c.openTickets} (${c.unresolvedPriorityTickets} priority)`,
            `Seats: ${c.seatsUsed} of ${c.seatsPurchased} in use`,
          ].join('\n');
        },
      },
      {
        name: 'get_retention_risk',
        description: 'Evaluates the churn risk of the customer currently shown on screen and recommends a next action.',
        inputSchema: { type: 'object', properties: {} },
        execute: () => {
          const store = inject(CustomerStore);
          const { name } = store.customer();
          const reasons = store.riskReasons();
          if (reasons.length === 0) {
            return `${name} is low risk. No warning signs detected.\n\nRecommended next action: none needed.`;
          }
          const action = store.isHighRisk()
            ? 'have customer success schedule a live session this week.'
            : 'send a friendly check-in and watch the account.';
          return [
            `${name} ${store.isHighRisk() ? 'is at risk' : 'needs attention'}.`,
            '',
            'Reasons:',
            ...reasons.map((reason) => `- ${reason}`),
            '',
            `Recommended next action: ${action}`,
          ].join('\n');
        },
      },
      {
        name: 'draft_customer_success_note',
        description: 'Drafts an outreach email to the customer currently shown on screen, tuned to their risk level.',
        inputSchema: { type: 'object', properties: {} },
        execute: () => {
          const store = inject(CustomerStore);
          const firstName = store.customer().name.split(' ')[0];
          const body = store.isHighRisk()
            ? "I noticed you may have run into a few issues recently and wanted to reach out personally. Could we set up a short session this week to walk through your setup and clear any blockers?"
            : "Just checking in to make sure everything is going smoothly. If there's anything we can help with, reply to this email any time.";
          return `Hi ${firstName},\n\n${body}\n\nThanks,\nCustomer Success Team`;
        },
      },
    ]),
  ],
};
