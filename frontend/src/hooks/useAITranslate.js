import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { translateToTamilAI } from "../services/aiTranslation";

/**
 * Custom React Hook that automatically translates text to Tamil when language is toggled,
 * backed by Gemini AI + agricultural domain caching.
 */
export function useAITranslate(text) {
  const { state } = useApp();
  const isTamil = state.language === "Tamil";
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!isTamil || !text) {
      setTranslated(text);
      return;
    }

    let isMounted = true;
    translateToTamilAI(text).then((res) => {
      if (isMounted) setTranslated(res);
    });

    return () => {
      isMounted = false;
    };
  }, [text, isTamil]);

  return translated;
}
