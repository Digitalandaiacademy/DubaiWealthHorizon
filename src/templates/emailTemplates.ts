export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_dubaiwealthhorizon',
  TEMPLATE_ID: 'template_newpayment',
  PUBLIC_KEY: 'HpZiWLtqNkXv388qo', // À remplacer par votre clé publique EmailJS
  ADMIN_EMAIL: 'mustangfally@gmail.com'
};

export const EMAIL_TEMPLATE = `
Nouvelle demande d'investissement

Détails de l'investisseur :
Nom : {{user_name}}
Email : {{user_email}}

Détails de l'investissement :
Plan : {{plan_name}}
Montant : {{amount}} FCFA
Méthode de paiement : {{payment_method}}
ID de transaction : {{transaction_id}}

Veuillez vérifier cette demande d'investissement dans votre tableau de bord administrateur.
`;
