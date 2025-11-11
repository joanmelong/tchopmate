/**
 * Initialisation du container DI
 * À appeler au démarrage de l'application
 */

import { supabase } from '../supabaseClient';
import { DIContainer } from './container';

// Initialiser le container avec Supabase
DIContainer.initialize(supabase);

// Exporter le container pour l'utiliser dans l'app
export { getDI } from './container';
export { DIContainer };
