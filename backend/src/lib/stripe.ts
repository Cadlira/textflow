import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' as any,
});

export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
export const STRIPE_PRO_PLUS_PRICE_ID = process.env.STRIPE_PRO_PLUS_PRICE_ID!;
