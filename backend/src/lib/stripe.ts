import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return _stripe;
}

// Backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';
export const STRIPE_PRO_PLUS_PRICE_ID = process.env.STRIPE_PRO_PLUS_PRICE_ID || '';
