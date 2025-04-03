import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_c6ou0li',
  TEMPLATE_ID: 'template_006493b',
  PUBLIC_KEY: 'HpZiWLtqNkXv388qo'
};

interface PaymentNotificationEmail {
  userFullName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  planName: string;
}

// Initialiser EmailJS avec la clé publique
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendPaymentNotificationEmail = async (data: PaymentNotificationEmail) => {
  try {
    const templateParams = {
      user_name: data.userFullName,
      user_email: data.userEmail,
      amount: data.amount.toLocaleString('fr-FR'),
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      plan_name: data.planName
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('Email envoyé avec succès:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};
