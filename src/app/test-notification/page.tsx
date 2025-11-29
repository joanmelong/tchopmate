"use client"

import React, { useState } from 'react';
import { Bell, Send, Clock, User, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/use-notifications';

export default function TestNotificationPage() {
  const router = useRouter();
  const { addNotification, unreadCount } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  const [testData, setTestData] = useState({
    numeroCommande: 'CMD-' + Math.floor(Math.random() * 1000),
    clientNom: 'Jean Dupont',
    clientEmail: '', // À remplir par l'utilisateur
    creneauHeure: '12:30',
    montantTotal: '2500'
  });

  const envoyerEmailTest = async () => {
  setIsLoading(true);
  setEmailStatus(null);

  // 1. On calcule le délai jusqu'à "créneau - 15 min"
  const [hours, minutes] = testData.creneauHeure.split(':');
  const creneauDate = new Date();
  creneauDate.setHours(parseInt(hours));
  creneauDate.setMinutes(parseInt(minutes));
  creneauDate.setSeconds(0);

  const now = new Date();
  const delayMs = creneauDate.getTime() - now.getTime() - 15 * 60 * 1000; // -15 min

  if (delayMs <= 0) {
    setEmailStatus({
      success: false,
      message: "Le créneau est déjà passé ou dans moins de 15 min !"
    });
    setIsLoading(false);
    return;
  }

  setEmailStatus({
    success: true,
    message: `Envoi programmé dans ${Math.floor(delayMs / 60000)} minutes (à ${testData.creneauHeure})`
  });

  // 2. On programme l’envoi réel
  setTimeout(async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          titre: `Commande #${testData.numeroCommande} prête bientôt`,
          message: `Votre commande sera prête à ${testData.creneauHeure}. Venez la récupérer !`,
          type: 'rappel_creneau'
        });

        // Optionnel : tu peux fetch cette page pour updater le statut
        setEmailStatus({ success: true, message: "Email envoyé à l'heure exacte !" });
      }
    } catch (err) {
      console.error(err);
    }
  }, delayMs);

  setIsLoading(false);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header avec cloche */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
                🧪 Test Notifications Email
              </h1>
            </div>
            <p className="text-gray-600 ml-14">
              Testez l&apos;envoi d&apos;emails et voyez la cloche s&apos;incrémenter en temps réel
            </p>
          </div>
          
          {/* Cloche de notification en temps réel */}
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <Button 
                variant="ghost" 
                className="p-3 rounded-full hover:bg-gray-100 relative"
                onClick={() => router.push('/menu')}
                title="Cliquez pour voir toutes les notifications"
              >
                <Bell className={`h-7 w-7 transition-colors ${unreadCount > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
            {unreadCount > 0 ? (
              <p className="text-xs text-center text-orange-600 font-semibold mt-1">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-xs text-center text-gray-400 mt-1">
                Aucune notification
              </p>
            )}
          </div>
        </div>

        {/* Formulaire de test */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Données de la commande test
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de commande
              </label>
              <input
                type="text"
                value={testData.numeroCommande}
                onChange={(e) => setTestData({...testData, numeroCommande: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={testData.clientNom}
                  onChange={(e) => setTestData({...testData, clientNom: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={testData.clientEmail}
                  onChange={(e) => setTestData({...testData, clientEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="votre.email@gmail.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Entrez votre vrai email pour recevoir le mail de test
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure créneau
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={testData.creneauHeure}
                    onChange={(e) => setTestData({...testData, creneauHeure: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="text"
                  value={testData.montantTotal}
                  onChange={(e) => setTestData({...testData, montantTotal: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          {emailStatus && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              emailStatus.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {emailStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  emailStatus.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {emailStatus.success ? 'Succès !' : 'Erreur'}
                </p>
                <p className={`text-sm ${
                  emailStatus.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {emailStatus.message}
                </p>
                {emailStatus.success && (
                  <p className="text-xs text-green-500 mt-2">
                    🔔 Regardez la cloche en haut à droite - elle s&apos;est incrémentée !
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bouton */}
          <button
            onClick={envoyerEmailTest}
            disabled={isLoading || !testData.clientEmail}
            className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all transform ${
              isLoading || !testData.clientEmail
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                Envoyer Email RÉEL 
              </span>
            )}
          </button>

          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 text-center">
              💡 L&apos;email sera envoyé RÉELLEMENT et la cloche s&apos;incrémentera automatiquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}