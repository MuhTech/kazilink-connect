import { useT, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { lang, setLang } = useT();
  const toggle = () => setLang((lang === "en" ? "sw" : "en") as Lang);
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Change language" className="uppercase tracking-wide">
      {lang === "en" ? "SW" : "EN"}
    </Button>
  );
}