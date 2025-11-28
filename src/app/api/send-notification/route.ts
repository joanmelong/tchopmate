import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      numeroCommande, 
      clientNom, 
      clientEmail, 
      creneauHeure, 
      montantTotal 
    } = body;

    // Configuration du transporteur Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Contenu de l'email en HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .creneau-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .time { font-size: 32px; font-weight: bold; color: #dc2626; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🍽️ TchopMate</h1>
            <p style="margin: 10px 0 0 0;">Votre repas est bientôt prêt !</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${clientNom} ! 👋</h2>
            
            <p style="font-size: 16px;">
              Votre commande <strong>#${numeroCommande}</strong> sera prête dans <strong>15 minutes</strong>.
            </p>
            
            <div class="creneau-box">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">📅 Date de récupération :</p>
              <p style="margin: 5px 0; font-size: 18px; font-weight: 600;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
              
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">⏰ Créneau horaire :</p>
              <div class="time">${creneauHeure}</div>
            </div>
            
            <p style="font-size: 15px; background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
              💡 <strong>Conseil :</strong> Préparez-vous à venir récupérer votre commande pour éviter l'attente !
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
              Montant total : <strong style="color: #f59e0b;">${montantTotal} FCFA</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Merci de votre confiance ! 🙏</p>
            <p style="margin: 5px 0;">L'équipe TchopMate - Restaurant Universitaire</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
              Ceci est un message automatique, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email
    await transporter.sendMail({
      from: `"TchopMate Restaurant" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `🔔 Rappel : Votre commande #${numeroCommande} est bientôt prête`,
      html: htmlContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé avec succès' 
    });

  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}