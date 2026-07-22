import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "sw";

const dict = {
  en: {
    brand: "KaziLink Tanzania",
    tagline: "Connecting Skills with Opportunities Across Tanzania",
    nav: { jobs: "Jobs", dashboard: "Dashboard", signin: "Sign in", signup: "Get started", signout: "Sign out", profile: "Profile", employer: "Employer", admin: "Admin", applications: "My Applications" },
    home: { heroCta: "Find your next job", employerCta: "Post a job", featured: "Featured categories", stats: "Trusted employment platform" },
    auth: { welcome: "Welcome back", createAccount: "Create your account", email: "Email", password: "Password", fullName: "Full name", role: "I am a…", jobSeeker: "Job seeker", employer: "Employer", google: "Continue with Google", or: "or", haveAccount: "Already have an account?", noAccount: "Don’t have an account?", forgot: "Forgot password?" },
    jobs: { title: "Browse jobs", search: "Search jobs, skills, companies", filterCategory: "Category", filterType: "Employment type", filterRemote: "Remote only", empty: "No jobs match your filters yet.", apply: "Apply now", applied: "Applied", deadline: "Deadline", posted: "Posted", location: "Location", salary: "Salary", allCategories: "All categories", allTypes: "All types", details: "Details" },
    profile: { title: "Your profile", fullName: "Full name", phone: "Phone", bio: "Bio", location: "Location", headline: "Headline", language: "Preferred language", save: "Save changes", saved: "Profile saved", avatar: "Avatar", upload: "Upload" },
    company: { list: "My companies", create: "Create company", name: "Company name", industry: "Industry", size: "Company size", website: "Website", description: "Description", verification: "Verification", pending: "Pending review", verified: "Verified", rejected: "Rejected", submit: "Submit for verification", logo: "Logo" },
    jobForm: { create: "Post a job", edit: "Edit job", title: "Job title", description: "Description", requirements: "Requirements", responsibilities: "Responsibilities", location: "Location", type: "Employment type", level: "Experience level", salaryMin: "Minimum salary (TZS)", salaryMax: "Maximum salary (TZS)", deadline: "Application deadline", remote: "Remote", publish: "Publish", saveDraft: "Save as draft", category: "Category", company: "Company", skills: "Skills (comma separated)" },
    application: { cover: "Cover letter", resume: "Resume (PDF)", submit: "Submit application", already: "You have already applied to this job.", withdraw: "Withdraw", status: "Status" },
    employer: { jobs: "My job postings", applicants: "Applicants", newJob: "New job" },
    admin: { title: "Admin", verify: "Verify", reject: "Reject", categories: "Categories", companies: "Companies to review", settings: "Platform settings" },
    empty: { loading: "Loading…", error: "Something went wrong", none: "Nothing here yet" },
  },
  sw: {
    brand: "KaziLink Tanzania",
    tagline: "Kuunganisha Ujuzi na Fursa Kote Tanzania",
    nav: { jobs: "Kazi", dashboard: "Dashibodi", signin: "Ingia", signup: "Anza", signout: "Toka", profile: "Wasifu", employer: "Mwajiri", admin: "Msimamizi", applications: "Maombi Yangu" },
    home: { heroCta: "Tafuta kazi yako inayofuata", employerCta: "Tangaza kazi", featured: "Aina za kazi zilizoangaziwa", stats: "Jukwaa la ajira linaloaminika" },
    auth: { welcome: "Karibu tena", createAccount: "Fungua akaunti yako", email: "Barua pepe", password: "Nywila", fullName: "Jina kamili", role: "Mimi ni…", jobSeeker: "Mtafuta kazi", employer: "Mwajiri", google: "Endelea na Google", or: "au", haveAccount: "Tayari una akaunti?", noAccount: "Huna akaunti?", forgot: "Umesahau nywila?" },
    jobs: { title: "Vinjari kazi", search: "Tafuta kazi, ujuzi, kampuni", filterCategory: "Aina", filterType: "Aina ya ajira", filterRemote: "Mtandaoni pekee", empty: "Hakuna kazi zinazolingana.", apply: "Omba sasa", applied: "Umeomba", deadline: "Mwisho", posted: "Iliwekwa", location: "Eneo", salary: "Mshahara", allCategories: "Aina zote", allTypes: "Aina zote", details: "Maelezo" },
    profile: { title: "Wasifu wako", fullName: "Jina kamili", phone: "Simu", bio: "Wasifu mfupi", location: "Mahali", headline: "Kichwa", language: "Lugha unayopendelea", save: "Hifadhi", saved: "Wasifu umehifadhiwa", avatar: "Picha", upload: "Pakia" },
    company: { list: "Kampuni zangu", create: "Fungua kampuni", name: "Jina la kampuni", industry: "Sekta", size: "Ukubwa", website: "Tovuti", description: "Maelezo", verification: "Uthibitisho", pending: "Inasubiri ukaguzi", verified: "Imethibitishwa", rejected: "Imekataliwa", submit: "Wasilisha kwa ukaguzi", logo: "Nembo" },
    jobForm: { create: "Tangaza kazi", edit: "Hariri kazi", title: "Jina la kazi", description: "Maelezo", requirements: "Mahitaji", responsibilities: "Majukumu", location: "Eneo", type: "Aina ya ajira", level: "Kiwango cha uzoefu", salaryMin: "Mshahara wa chini (TZS)", salaryMax: "Mshahara wa juu (TZS)", deadline: "Tarehe ya mwisho", remote: "Mtandaoni", publish: "Chapisha", saveDraft: "Hifadhi rasimu", category: "Aina", company: "Kampuni", skills: "Ujuzi (tenganisha kwa koma)" },
    application: { cover: "Barua ya maombi", resume: "Wasifu (PDF)", submit: "Wasilisha ombi", already: "Tayari umeomba kazi hii.", withdraw: "Ondoa", status: "Hali" },
    employer: { jobs: "Kazi zangu", applicants: "Waombaji", newJob: "Kazi mpya" },
    admin: { title: "Msimamizi", verify: "Thibitisha", reject: "Kataa", categories: "Aina", companies: "Kampuni za kukagua", settings: "Mipangilio ya jukwaa" },
    empty: { loading: "Inapakia…", error: "Kuna kitu kimeenda vibaya", none: "Bado hakuna kitu" },
  },
} as const;

type Dict = typeof dict.en;

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: dict.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("kazilink.lang") as Lang | null)) || null;
    if (saved === "en" || saved === "sw") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("kazilink.lang", l);
  };
  return <LangCtx.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangCtx.Provider>;
}

export function useT() {
  return useContext(LangCtx);
}