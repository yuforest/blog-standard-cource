import Cors from 'micro-cors';

import stripeInit from 'stripe';
import verifyStripe from '@webdeveducation/next-verify-stripe';
import clientPromise from '../../../lib/mongodb';

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new stripeInit(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {
  let event;
  if (req.method === 'POST') {
    try {
      event = await verifyStripe({
        req,
        stripe,
        endpointSecret,
      });
    } catch (e) {
      console.log(e);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const client = await clientPromise;
        const db = client.db('BlogStandard');
        const paymentIntent = event.data.object;
        const auth0Id = paymentIntent.metadata.sub;
        console.log(auth0Id);
        const userProfile = await db.collection('users').updateOne(
          {
            auth0Id,
          },
          {
            $inc: {
              availableTokens: 10,
            },
            $setOnInsert: {
              auth0Id,
            },
          },
          {
            upsert: true,
          },
        );
      }
      default:
        console.log('UNHANDLED EVENT: ', event.type);
    }
    res.status(200).json({ received: true });
  }
};

export default cors(handler);
