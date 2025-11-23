// scripts/test-order-email.ts
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Charger les variables d'environnement
dotenv.config();

console.log('===  VÉRIFICATION CONFIGURATION ===');
console.log(' Email:', process.env.GMAIL_USER);
console.log(' Mot de passe présent:', process.env.GMAIL_APP_PASSWORD ? 'OUI ' : 'NON ');
console.log(' Longueur:', process.env.GMAIL_APP_PASSWORD?.length || 0, 'caractères (doit être 16)');
console.log('=====================================\n');

// Vérifications
if (!process.env.GMAIL_USER) {
  console.error(' GMAIL_USER manquant dans .env');
  process.exit(1);
}

if (!process.env.GMAIL_APP_PASSWORD) {
  console.error(' GMAIL_APP_PASSWORD manquant dans .env');
  process.exit(1);
}

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// ========== DONNÉES DE TEST : COMMANDE ==========

const mockOrder = {
  id: 'ORDER-001',
  student_name: 'Jean Dupont',
  student_email: process.env.GMAIL_USER, // S'envoyer à soi-même pour tester
  dish_name: 'Ndolé avec Plantain',
  prix_total: 1500,
  time_slot: '12h00-12h15',
  notes: 'Sans piment'
};

console.log(' Commande de test:');
console.log('   - Plat:', mockOrder.dish_name);
console.log('   - Prix:', mockOrder.prix_total, 'FCFA');
console.log('   - Étudiant:', mockOrder.student_name);
console.log('   - Créneau:', mockOrder.time_slot);
console.log('');

// ========== EMAIL SIMPLE ==========

const emailContent = `
Bonjour ${mockOrder.student_name},

Votre commande a été confirmée avec succès !

DÉTAILS DE LA COMMANDE
-----------------------
Numéro : #${mockOrder.id}
Plat : ${mockOrder.dish_name}
Prix : ${mockOrder.prix_total} FCFA
Créneau de retrait : ${mockOrder.time_slot}
${mockOrder.notes ? `Note : ${mockOrder.notes}` : ''}

RAPPEL
------
Vous recevrez un rappel par email 15 minutes avant votre créneau de retrait.

Bon appétit !

---
L'équipe TchopMate
Restaurant Universitaire Connecté
`;

// ========== ENVOI DE L'EMAIL ==========

console.log(' Envoi de l\'email de confirmation...\n');

transporter.sendMail({
  from: `"TchopMate" <${process.env.GMAIL_USER}>`,
  to: mockOrder.student_email,
  subject: `Commande confirmée - ${mockOrder.dish_name}`,
  text: emailContent
}).then(() => {
  console.log(' EMAIL ENVOYÉ AVEC SUCCÈS !');
  console.log('');
  console.log(' Vérifiez votre boîte mail :', mockOrder.student_email);
  console.log('');
  console.log('===  RÉSUMÉ ===');
  console.log('De: TchopMate <' + process.env.GMAIL_USER + '>');
  console.log('À:', mockOrder.student_email);
  console.log('Sujet: Commande confirmée - ' + mockOrder.dish_name);
  console.log('================');
  console.log('');
  console.log(' Configuration Gmail fonctionnelle !');
}).catch((error) => {
  console.error(' ERREUR:', error.message);
  console.error('');
  console.error(' VÉRIFIEZ:');
  console.error('1. Mot de passe sans espaces dans .env');
  console.error('2. Email correct');
  console.error('3. Validation en 2 étapes activée');
  console.error('');
  console.error('Re-générez un mot de passe: https://myaccount.google.com/apppasswords');
  process.exit(1);
});


