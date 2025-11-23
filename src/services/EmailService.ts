// src/services/EmailService.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async sendReminder(
    to: string,
    data: {
      student_name: string;
      dish_name: string;
      time_slot: string;
      order_id: string;
    }
  ): Promise<void> {
    const emailContent = `
Bonjour ${data.student_name},

⏰ RAPPEL : Votre commande est dans 15 minutes !

VOTRE COMMANDE
--------------
Plat : ${data.dish_name}
Créneau : ${data.time_slot}
Numéro : #${data.order_id}

N'oubliez pas de venir retirer votre commande au comptoir.

À tout de suite !

---
L'équipe TchopMate
    `;

    await this.transporter.sendMail({
      from: `"TchopMate Rappel" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `⏰ Votre commande dans 15 minutes !`,
      text: emailContent
    });
  }

  async sendOrderConfirmation(
    to: string,
    data: {
      student_name: string;
      dish_name: string;
      prix_total: number;
      time_slot: string;
      order_id: string;
      notes?: string;
    }
  ): Promise<void> {
    const emailContent = `
Bonjour ${data.student_name},

Votre commande a été confirmée avec succès !

DÉTAILS DE LA COMMANDE
-----------------------
Numéro : #${data.order_id}
Plat : ${data.dish_name}
Prix : ${data.prix_total} FCFA
Créneau de retrait : ${data.time_slot}
${data.notes ? `Note : ${data.notes}` : ''}

RAPPEL
------
Vous recevrez un rappel par email 15 minutes avant votre créneau.

Bon appétit !

---
L'équipe TchopMate
    `;

    await this.transporter.sendMail({
      from: `"TchopMate" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Commande confirmée - ${data.dish_name}`,
      text: emailContent
    });
  }
}



import * as dotenv from 'dotenv';


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

if (process.env.GMAIL_APP_PASSWORD.length !== 16) {
  console.error('  ATTENTION : Le mot de passe devrait faire 16 caractères');
  console.error('   Actuel:', process.env.GMAIL_APP_PASSWORD.length, 'caractères');
  console.error('   Vérifiez qu\'il n\'y a pas d\'espaces ou de guillemets');
}

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

console.log('📤 Tentative d\'envoi d\'email...\n');

// Envoi de l'email de test
transporter.sendMail({
  from: `"TchopMate Test" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER, // Envoyer à soi-même pour tester
  subject: '🧪 Test de configuration Gmail',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>✅ Configuration réussie !</h2>
      <p>Si vous recevez cet email, votre configuration Gmail fonctionne parfaitement.</p>
      <hr>
      <p><strong>Configuration testée :</strong></p>
      <ul>
        <li>Email: ${process.env.GMAIL_USER}</li>
        <li>Mot de passe d'application: ${process.env.GMAIL_APP_PASSWORD?.substring(0, 4)}****</li>
      </ul>
      <p style="color: green;">🎉 Prêt pour TchopMate !</p>
    </div>
  `
}).then(() => {
  console.log(' Email envoyé avec succès !');
  console.log('📬 Vérifiez votre boîte mail :', process.env.GMAIL_USER);
}).catch((error) => {
  console.error(' Erreur lors de l\'envoi:', error.message);
  console.error('\💡 SOLUTIONS POSSIBLES:');
  console.error('1. Vérifiez que le mot de passe dans .env est SANS ESPACES');
  console.error('2. Re-générez un nouveau mot de passe d\'application');
  console.error('3. Vérifiez que la validation en 2 étapes est activée');
  console.error('4. Vérifiez que l\'email est correct');
});