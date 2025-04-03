import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_dubaiwealthhorizon',
  TEMPLATE_ID: 'template_newpayment',
  PUBLIC_KEY: 'HpZiWLtqNkXv388qo',
  ADMIN_EMAIL: 'mustangfally@gmail.com'
};

interface PaymentNotificationEmail {
  userFullName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  planName: string;
}

// Initialiser EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendPaymentNotificationEmail = async (data: PaymentNotificationEmail) => {
  try {
    console.log('Préparation de l\'envoi de l\'email...');

    const templateParams = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      user_name: data.userFullName,
      user_email: data.userEmail,
      amount: data.amount.toLocaleString('fr-FR'),
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      plan_name: data.planName,
      message: `
Nouvelle demande d'investissement

Détails de l'investisseur :
Nom : ${data.userFullName}
Email : ${data.userEmail}

Détails de l'investissement :
Plan : ${data.planName}
Montant : ${data.amount.toLocaleString('fr-FR')} FCFA
Méthode de paiement : ${data.paymentMethod}
ID de transaction : ${data.transactionId}

Veuillez vérifier cette demande d'investissement dans votre tableau de bord administrateur.
      `.trim()
    };

    console.log('Paramètres de l\'email:', templateParams);

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
