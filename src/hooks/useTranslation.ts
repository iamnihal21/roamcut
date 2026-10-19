import { useAppStore } from '../store/useAppStore';
import { strings } from '../../constants/strings';

export type Language = keyof typeof strings;

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const dict = strings[language as Language] ?? strings.en;

  // Helper to get localized template name based on the template ID
  const getTemplateName = (templateId: string, fallbackName: string) => {
    const names = (dict as any).templateNames;
    return names?.[templateId] || fallbackName;
  };

  return {
    t: dict,
    language,
    getTemplateName,
  };
}