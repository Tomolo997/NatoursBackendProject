import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51IdbjtLHUylvxLGERt8KzVbyajRcAkoLrQLJySdNOrGOd6vwOaIREXvoEAoyu7ASFryKCl4wMMEPxqINMNheY81C00oVagKgp0'
);
export const bookTour = async (tourID) => {
  //1) get the session from the server

  try {
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourID}`
    );
    console.log(session);
    console.log(stripe);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (error) {
    showAlert('error', error);
  }

  //2)create checout form + harge the credit card
};
