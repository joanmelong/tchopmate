import * as React from 'react'
import { Logo } from '../logo'

export function Footer() {
    return(
        <footer className="bg-black text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="small" />
              </div>
              <p className="text-gray-300 text-sm">
                TchopMate - Votre compagnon pour les repas universitaires. Commandez facilement et savourez les
                meilleurs plats du campus.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Liens utiles</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Conditions d&apos;utilisation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>📍 Institut Universitaire Saint Jean, Eyang</p>
                <p>📞 +237 6XX XXX XXX</p>
                <p>✉️ tchopmate.restoapp@gmail.com</p>
                <p>🕒 Lun-Ven: 7h-20h | Sam-Dim: 8h-18h</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2025 TchopMate. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    )
}