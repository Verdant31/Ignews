import Stripe from 'stripe';


//Definindo a conexão com a API do stripe
export const stripe = new Stripe(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'Ignews',
      version: '0.1.0'
    },
  }
)