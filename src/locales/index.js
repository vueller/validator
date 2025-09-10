/**
 * Locale exports - centralized export for all language files
 */

import en from './en.js';
import ptBR from './pt-BR.js';

export const locales = {
  'en': en,
  'pt-BR': ptBR,
  'pt': ptBR // Alias for pt-BR
};

export { en, ptBR };

export default locales;
