import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translateToTamilAI, DOMAIN_DICTIONARY } from '../services/aiTranslation';

/**
 * Universal AI Translation Component <T>
 * Automatically translates children text to Tamil when Tamil language is selected.
 * Uses 0ms dictionary cache first, then localStorage, then Gemini API.
 */
export default function T({ children }) {
  const { state } = useApp();
  const isTamil = state.language === 'Tamil';
  const rawText = typeof children === 'string' ? children : String(children ?? '');
  
  // Instant synchronous lookup if in dictionary
  const initialText = isTamil && DOMAIN_DICTIONARY[rawText.trim()] 
    ? DOMAIN_DICTIONARY[rawText.trim()] 
    : rawText;

  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (!isTamil) {
      setText(rawText);
      return;
    }

    // Check synchronous dictionary first
    if (DOMAIN_DICTIONARY[rawText.trim()]) {
      setText(DOMAIN_DICTIONARY[rawText.trim()]);
      return;
    }

    let isMounted = true;
    translateToTamilAI(rawText).then((translated) => {
      if (isMounted) setText(translated);
    });

    return () => {
      isMounted = false;
    };
  }, [rawText, isTamil]);

  return <>{text}</>;
}
