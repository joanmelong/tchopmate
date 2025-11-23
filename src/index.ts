import * as dotenv from 'dotenv';
import { ReminderScheduler } from './Reminder/ReminderScheduler';
import { EmailService } from './services/EmailService';

dotenv.config();

console.log('╔════════════════════════════════════════╗');
console.log('║   TchopMate - Serveur de Rappels      ║');
console.log('╚════════════════════════════════════════╝');
console.log('');

// Vérifications
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error(' Variables d\'environnement manquantes :');
  console.error('   GMAIL_USER et GMAIL_APP_PASSWORD requis');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error(' Variables d\'environnement manquantes :');
  console.error('   SUPABASE_URL et SUPABASE_KEY requis');
  process.exit(1);
}

console.log('✅ Configuration validée');
console.log('');

// Initialiser les services
const emailService = new EmailService();
const scheduler = new ReminderScheduler(emailService);

// Démarrer le scheduler
scheduler.start();

console.log(' Serveur démarré avec succès');
console.log(' Email:', process.env.GMAIL_USER);
console.log(' Le scheduler vérifie les rappels toutes les minutes');
console.log('');
console.log('Appuyez sur Ctrl+C pour arrêter');
console.log('');

// Garder le processus en vie
setInterval(() => {}, 1000);

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('');
  console.log(' Arrêt du serveur...');
  process.exit(0);
});
