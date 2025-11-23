// backend/src/jobs/ReminderScheduler.ts
import cron from 'node-cron';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EmailService } from '../services/EmailService';

// Cache en mémoire des rappels envoyés
const sentReminders = new Set<string>();

//  TYPES
interface CompteData {
  email: string;
  prenom: string;
  nom: string;
}

interface PlatData {
  nom: string;
}

interface LigneCommandeData {
  plats: PlatData | null;
}

interface CommandeData {
  id: number;
  etudiant_id: number;
  statut: string;
  created_at: string;
  ligne_commandes: LigneCommandeData[] | null;
  compte: CompteData | null;
}

export class ReminderScheduler {
  private supabase: SupabaseClient;
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
    
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  start(): void {
    console.log(' Scheduler de rappels démarré');

    cron.schedule('* * * * *', async () => {
      await this.checkAndSendReminders();
    });

    cron.schedule('0 0 * * *', () => {
      sentReminders.clear();
      console.log(' Cache des rappels réinitialisé');
    });
  }

  private async checkAndSendReminders(): Promise<void> {
    try {
      const now = new Date();
      const targetTime = new Date(now.getTime() + 15 * 60 * 1000);
      
      const targetHour = targetTime.getHours().toString().padStart(2, '0');
      const targetMinute = targetTime.getMinutes().toString().padStart(2, '0');
      const targetTimeStr = `${targetHour}h${targetMinute}`;

      console.log(` [${now.toLocaleTimeString('fr-FR')}] Vérification pour ${targetTimeStr}...`);

      const { data, error } = await this.supabase
        .from('commandes')
        .select(`
          id,
          etudiant_id,
          statut,
          created_at,
          ligne_commandes!inner (
            plats (
              nom
            )
          ),
          compte!commandes_etudiant_id_fkey (
            email,
            prenom,
            nom
          )
        `)
        .in('statut', ['en_attente', 'en_preparation', 'pret'])
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error('    Erreur Supabase:', error.message);
        return;
      }

    
      if (!data) {
        console.log('   Aucune donnée retournée');
        return;
      }

      const orders = data as unknown as CommandeData[];

      if (orders.length === 0) {
        console.log('   Aucune commande trouvée');
        return;
      }

      const ordersToRemind = orders.filter(order => 
        !sentReminders.has(order.id.toString())
      );

      if (ordersToRemind.length === 0) {
        console.log('   Tous les rappels déjà envoyés');
        return;
      }

      console.log(`    ${ordersToRemind.length} rappel(s) à envoyer`);

      for (const order of ordersToRemind) {
        try {
          const user = order.compte;
          const firstPlat = order.ligne_commandes?.[0]?.plats;
          
          if (!user || !user.email) {
            console.error(`     Pas d'email pour commande ${order.id}`);
            continue;
          }

          await this.emailService.sendReminder(user.email, {
            student_name: `${user.prenom} ${user.nom}`,
            dish_name: firstPlat?.nom || 'Votre plat',
            time_slot: targetTimeStr,
            order_id: order.id.toString()
          });

          sentReminders.add(order.id.toString());

          console.log(`   ✅ Rappel envoyé à ${user.email} (commande ${order.id})`);

        } catch (error: any) {
          console.error(`    Erreur commande ${order.id}:`, error.message);
        }
      }

    } catch (error: any) {
      console.error(' Erreur scheduler:', error.message);
    }
  }
}