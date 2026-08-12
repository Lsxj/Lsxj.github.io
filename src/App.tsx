import { useEffect, useMemo, useState } from "react";
import { content, type Language } from "./content";

const sectionIds = ["intro", "capabilities", "case-study", "engineering", "enterprise", "journey", "connect"] as const;

function initialLanguage(): Language {
  const stored = window.localStorage.getItem("portfolio-language");
  if (stored === "en" || stored === "zh") return stored;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return <span aria-hidden="true" className={`arrow arrow--${direction}`}>→</span>;
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [activeSection, setActiveSection] = useState(0);
  const t = content[language];

  const sections = useMemo(() => sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[], []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh" ? "史学佳 — Senior Full-Stack Engineer" : "Xuejia Shi — Senior Full-Stack Engineer";
    window.localStorage.setItem("portfolio-language", language);
  }, [language]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(sectionIds.indexOf(visible.target.id as typeof sectionIds[number]));
    }, { threshold: [0.3, 0.55, 0.8] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!["ArrowDown", "ArrowRight", "PageDown", "ArrowUp", "ArrowLeft", "PageUp", "Home", "End"].includes(event.key)) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      let next = activeSection;
      if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) next += 1;
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) next -= 1;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = sectionIds.length - 1;
      next = Math.max(0, Math.min(sectionIds.length - 1, next));
      document.getElementById(sectionIds[next])?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection]);

  const selectLanguage = (next: Language) => setLanguage(next);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#intro" aria-label={language === "zh" ? "返回首页" : "Back to intro"}>
          <span className="brand-mark" aria-hidden="true">XS</span>
          <span className="brand-name">{language === "zh" ? "史学佳" : "Xuejia Shi"}</span>
        </a>
        <nav className="top-nav" aria-label={language === "zh" ? "主导航" : "Primary navigation"}>
          {sectionIds.slice(1, 6).map((id, index) => <a key={id} href={`#${id}`}>{t.nav[index + 1]}</a>)}
        </nav>
        <div className="language-switch" aria-label={language === "zh" ? "语言选择" : "Language selection"}>
          <button className={language === "en" ? "active" : ""} onClick={() => selectLanguage("en")} aria-pressed={language === "en"}>EN</button>
          <span>/</span>
          <button className={language === "zh" ? "active" : ""} onClick={() => selectLanguage("zh")} aria-pressed={language === "zh"}>中</button>
        </div>
      </header>

      <aside className="section-rail" aria-label={language === "zh" ? "章节导航" : "Section navigation"}>
        {sectionIds.map((id, index) => (
          <a className={activeSection === index ? "active" : ""} href={`#${id}`} key={id} aria-label={t.nav[index]} aria-current={activeSection === index ? "true" : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span>
          </a>
        ))}
      </aside>

      <main id="main-content">
        <section className="slide hero" id="intro">
          <div className="hero-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          <div className="slide-inner hero-inner">
            <p className="kicker hero-kicker">{t.eyebrow}</p>
            <h1>{t.heroTitle}</h1>
            <p className="hero-body">{t.heroBody}</p>
            <div className="tag-row">{t.heroTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="actions">
              <a className="button button--primary" href="#case-study">{t.openCase}<Arrow direction="down" /></a>
              <ExternalLink className="button button--text" href="https://github.com/Lsxj">{t.github}<Arrow /></ExternalLink>
            </div>
            <div className="hero-signature" aria-hidden="true">
              <span>09</span><small>{language === "zh" ? "年研发经验" : "YEARS BUILDING"}</small>
            </div>
          </div>
        </section>

        <section className="slide slide--soft" id="capabilities">
          <div className="slide-inner">
            <p className="kicker">{t.capabilitiesKicker}</p>
            <div className="section-intro"><h2>{t.capabilitiesTitle}</h2><p>{t.capabilitiesBody}</p></div>
            <div className="capability-grid">
              {t.capabilities.map((item) => <article className="capability-card" key={item.n}><span className="card-number">{item.n}</span><h3>{item.title}</h3><p>{item.body}</p><strong>{item.proof}</strong></article>)}
            </div>
          </div>
        </section>

        <section className="slide case-slide" id="case-study">
          <div className="slide-inner">
            <p className="kicker kicker--light">{t.caseKicker}</p>
            <div className="case-heading"><div><h2>{t.caseTitle}</h2><p>{t.caseLead}</p></div><ExternalLink className="round-link" href="https://github.com/Lsxj/fushi-dazi"><span>{t.repo}</span><Arrow /></ExternalLink></div>
            <div className="case-content">
              <div className="case-copy">
                <article><h3>{t.caseProblemTitle}</h3><p>{t.caseProblem}</p></article>
                <article><h3>{t.caseRoleTitle}</h3><p>{t.caseRole}</p></article>
              </div>
              <div className="system-map" aria-label={language === "zh" ? "辅食搭子系统架构" : "Baby Food Buddy system architecture"}>
                <div className="map-node node-family"><small>{t.family}</small><strong>{t.mini}</strong></div>
                <div className="map-arrow" aria-hidden="true">→</div>
                <div className="map-node node-rules"><small>{t.rules}</small><strong>TypeScript</strong></div>
                <div className="map-arrow" aria-hidden="true">→</div>
                <div className="map-node node-api"><small>{t.api}</small><strong>Zod · oRPC</strong></div>
                <div className="map-branches" aria-hidden="true"><i /><i /></div>
                <div className="map-node node-console"><small>{t.console}</small><strong>React 19</strong></div>
                <div className="map-node node-tools"><small>{t.tooling}</small><strong>Reusable workflows</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="slide slide--soft" id="engineering">
          <div className="slide-inner">
            <p className="kicker">{t.engKicker}</p>
            <h2 className="wide-title">{t.engTitle}</h2>
            <div className="architecture-grid">{t.architecture.map((item) => <article key={item.step}><span>{item.step}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
            <div className="metric-grid">{t.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
            <aside className="boundary-note"><strong>{t.honestTitle}</strong><p>{t.honest}</p></aside>
          </div>
        </section>

        <section className="slide enterprise-slide" id="enterprise">
          <div className="slide-inner">
            <p className="kicker">{t.enterpriseKicker}</p>
            <div className="enterprise-header"><div><h2>{t.enterpriseTitle}</h2><p>{t.enterpriseBody}</p></div><span className="citi-wordmark">CITI</span></div>
            <div className="enterprise-stats">{t.enterpriseStats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
            <div className="enterprise-cases">
              <article><span className="case-index">A</span><h3>{t.citiDirect}</h3><p>{t.citiDirectBody}</p><div className="small-tags">{t.citiDirectTags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
              <article><span className="case-index">B</span><h3>{t.velocity}</h3><p>{t.velocityBody}</p><strong className="result-line">{t.velocityResult}</strong></article>
            </div>
            <p className="recognition">✦ {t.recognition}</p>
          </div>
        </section>

        <section className="slide slide--soft" id="journey">
          <div className="slide-inner">
            <p className="kicker">{t.journeyKicker}</p>
            <h2 className="wide-title">{t.journeyTitle}</h2>
            <div className="journey-layout">
              <div className="timeline">{t.journey.map((item) => <article key={item.date}><span>{item.date}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
              <div className="toolkit"><h3>{t.stackTitle}</h3><div className="skill-cloud">{t.stack.map((skill) => <span key={skill}>{skill}</span>)}</div><p className="education">{t.education}</p></div>
            </div>
          </div>
        </section>

        <section className="slide connect-slide" id="connect">
          <div className="slide-inner connect-inner">
            <div>
              <p className="kicker kicker--light">{t.connectKicker}</p>
              <h2>{t.connectTitle}</h2>
              <p className="connect-body">{t.connectBody}</p>
              <div className="actions">
                <a className="button button--white" href="mailto:lsxj615@foxmail.com">{t.emailMe}<Arrow /></a>
                <ExternalLink className="button button--ghost" href="https://github.com/Lsxj">GitHub / Lsxj<Arrow /></ExternalLink>
              </div>
            </div>
            <div className="contact-card"><small>EMAIL</small><a href="mailto:lsxj615@foxmail.com">lsxj615@foxmail.com</a><small>LOCATION</small><span>{t.location}</span><small>OPEN SOURCE</small><ExternalLink href="https://github.com/Lsxj/Lsxj.github.io">{t.source}</ExternalLink></div>
            <footer><a href="/archive/">{t.archive}</a><span>{t.copyright}</span></footer>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
