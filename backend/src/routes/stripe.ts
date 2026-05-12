import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { stripe, STRIPE_PRO_PRICE_ID, STRIPE_PRO_PLUS_PRICE_ID } from '../lib/stripe';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { JwtPayload } from '../middleware/auth';

const stripeRoutes = new Hono();

// ── Create Checkout Session ──
stripeRoutes.post('/checkout', authMiddleware, async (c) => {
  const { userId } = c.get('user') as JwtPayload;
  const { plan } = await c.req.json<{ plan: 'pro' | 'pro_plus' }>();

  const priceId = plan === 'pro_plus' ? STRIPE_PRO_PLUS_PRICE_ID : STRIPE_PRO_PRICE_ID;

  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://textflow.online/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://textflow.online/cancel',
    metadata: { userId, plan },
  });

  return c.json({ url: session.url });
});

// ── Customer Portal ──
stripeRoutes.post('/portal', authMiddleware, async (c) => {
  const { userId } = c.get('user') as JwtPayload;

  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.stripeCustomerId) {
    return c.json({ error: 'No active subscription' }, 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: 'https://textflow.online/account',
  });

  return c.json({ url: session.url });
});

// ── Webhook ──
stripeRoutes.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'Missing signature' }, 400);

  let event;
  try {
    const body = await c.req.text();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const plan = session.metadata?.plan || 'pro';

      await db
        .update(users)
        .set({
          plan: plan as 'pro' | 'pro_plus',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
        .where(eq(users.id, userId));

      console.log(`[Stripe] User ${userId} upgraded to ${plan}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({
          plan: 'free',
          stripeSubscriptionId: null,
        })
        .where(eq(users.stripeCustomerId, customerId));

      console.log(`[Stripe] Customer ${customerId} downgraded to free`);
      break;
    }
  }

  return c.json({ received: true });
});

export { stripeRoutes };
