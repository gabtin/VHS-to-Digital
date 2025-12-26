import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set');
}

export async function getUncachableStripeClient() {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  return new Stripe(stripeSecretKey);
}

export async function getStripePublishableKey() {
  return stripePublishableKey;
}

export async function getStripeSecretKey() {
  return stripeSecretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    if (!secretKey) {
      console.warn('Stripe secret key not set: Stripe sync will be disabled.');
      return null;
    }

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
