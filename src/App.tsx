import { useEffect, useState } from "react";
import { content, type Language } from "./content";

type GalleryView = 0 | 1 | 2 | 3;

function initialLanguage(): Language {
  const stored = window.localStorage.getItem("portfolio-language");
  if (stored === "en" || stored === "zh") return stored;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

const anchors = ["about", "journey", "projects", "contact"];
const projectIds = ["nextgen", "velocity", "platform", "fushi"];
const galleryImages = ["/assets/fushi-overview.jpg", "/assets/fushi-pain-points.jpg", "/assets/fushi-home-guide.jpg", "/assets/fushi-support.jpg"];

function projectFromUrl() {
  const id = new URLSearchParams(window.location.search).get("project");
  const index = id ? projectIds.indexOf(id) : -1;
  return index >= 0 ? index : null;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [galleryView, setGalleryView] = useState<GalleryView>(0);
  const [activeProject, setActiveProject] = useState<number | null>(projectFromUrl);
  const t = content[language];
  const projects = [...t.projects].sort((a, b) => projectIds.indexOf(a.id) - projectIds.indexOf(b.id));
  const selectedProject = activeProject === null ? null : projects[activeProject];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = selectedProject ? `${selectedProject.title} — ${t.name}` : `${t.name} — Senior Full-Stack Engineer`;
    window.localStorage.setItem("portfolio-language", language);
  }, [activeProject, language, selectedProject, t.name]);

  useEffect(() => {
    const syncRoute = () => setActiveProject(projectFromUrl());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeProject]);

  function showProject(index: number, replace = false) {
    const url = `${window.location.pathname}?project=${projectIds[index]}`;
    if (replace) window.history.replaceState({ portfolioProject: true }, "", url);
    else window.history.pushState({ portfolioProject: true }, "", url);
    setGalleryView(0);
    setActiveProject(index);
  }

  function returnHome() {
    if (window.history.state?.portfolioProject) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      setActiveProject(null);
    }
  }

  function LanguageSwitch() {
    return (
      <div className="language-switch" aria-label={language === "zh" ? "语言选择" : "Language selection"}>
        <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
        <span>/</span>
        <button className={language === "zh" ? "active" : ""} onClick={() => setLanguage("zh")} aria-pressed={language === "zh"}>中</button>
      </div>
    );
  }

  if (selectedProject && activeProject !== null) {
    const previousIndex = (activeProject - 1 + projects.length) % projects.length;
    const nextIndex = (activeProject + 1) % projects.length;

    if (selectedProject.id === "nextgen") {
      return (
        <div className="nextgen-deck" key={selectedProject.id}>
          <header className="nextgen-deck-header">
            <div className="nextgen-deck-primary">
              <button className="back-link" onClick={returnHome}><span aria-hidden="true">←</span>{t.backToPortfolio}</button>
              <div className="nextgen-deck-controls">
                <LanguageSwitch />
                <nav aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
                  <span>{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
                  <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
                </nav>
              </div>
            </div>

          </header>

          <main className="nextgen-deck-main">
            <div className="nextgen-page nextgen-page--solution">
              <section className="nextgen-slide-hero">
                <div className="nextgen-hero-title">
                  <p>{language === "zh" ? "01 · 核心项目 / 用户与权限管理" : "01 · Core project / User & Entitlements"}</p>
                  <h1>{selectedProject.title}</h1>
                  <strong>{selectedProject.detail.focus}</strong>
                  <span>{selectedProject.role}</span>
                </div>
                <aside className="nextgen-hero-context">
                  <p>{language === "zh" ? "项目背景" : "Project context"}</p>
                  <span>{selectedProject.detail.challenge}</span>
                  <strong>{selectedProject.detail.scope}</strong>
                </aside>
              </section>
              <section className="nextgen-results">
                <span>{language === "zh" ? "关键成果" : "Selected outcomes"}</span>
                <div className="nextgen-proof-strip nextgen-proof-strip--results">{selectedProject.detail.scaleMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
              </section>
              <section className="nextgen-contributions">
                <div className="nextgen-contributions-heading">
                  <h3>{language === "zh" ? "我的核心贡献" : "Selected contributions"}</h3>
                </div>
                <div className="nextgen-contribution-grid">
                  {selectedProject.detail.contributions.map(([title, body], index) => (
                    <article key={title}>
                      <span>0{index + 1}</span>
                      <h4>{title}</h4>
                      <p>{body}</p>
                    </article>
                  ))}
                </div>
              </section>
              <ul className="nextgen-stack-rail">{selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </main>
        </div>
      );
    }

    if (selectedProject.id === "velocity") {
      const velocityMetrics = language === "zh"
        ? [["≈60%", "首屏等待与白屏时间降幅"], ["端到端", "Typeahead 至完整搜索结果页"], ["Golden + Silver", "2019 / 2021 Citi Gratitude Awards"], ["技术分享", "公司级工程大会演讲"]] as const
        : [["≈60%", "less initial wait and blank-screen time"], ["End-to-end", "typeahead through the complete results page"], ["Golden + Silver", "2019 / 2021 Citi Gratitude Awards"], ["Tech talk", "company-wide engineering conference"]] as const;

      return (
        <div className="nextgen-deck velocity-deck" key={selectedProject.id}>
          <header className="nextgen-deck-header">
            <div className="nextgen-deck-primary">
              <button className="back-link" onClick={returnHome}><span aria-hidden="true">←</span>{t.backToPortfolio}</button>
              <div className="nextgen-deck-controls">
                <LanguageSwitch />
                <nav aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
                  <span>{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
                  <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
                </nav>
              </div>
            </div>
          </header>

          <main className="nextgen-deck-main">
            <div className="nextgen-page nextgen-page--solution">
              <section className="nextgen-slide-hero">
                <div className="nextgen-hero-title">
                  <p>{language === "zh" ? "02 · 核心项目 / 机构搜索与前端现代化" : "02 · Core project / Institutional search"}</p>
                  <h1>{selectedProject.title}</h1>
                  <strong>{selectedProject.detail.focus}</strong>
                  <span>{selectedProject.role}</span>
                </div>
                <aside className="nextgen-hero-context">
                  <p>{language === "zh" ? "项目背景" : "Project context"}</p>
                  <span>{selectedProject.detail.challenge}</span>
                  <strong>{selectedProject.detail.scope}</strong>
                </aside>
              </section>

              <section className="nextgen-results">
                <span>{language === "zh" ? "关键成果" : "Selected outcomes"}</span>
                <div className="nextgen-proof-strip nextgen-proof-strip--results">{velocityMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
              </section>

              <section className="nextgen-contributions">
                <div className="nextgen-contributions-heading"><h3>{language === "zh" ? "我的核心贡献" : "Selected contributions"}</h3></div>
                <div className="nextgen-contribution-grid">
                  {selectedProject.detail.approach.map((item, index) => {
                    const [title, body = item] = item.split(/——| — /, 2);
                    const displayBody = body.charAt(0).toUpperCase() + body.slice(1);
                    return <article key={item}><span>0{index + 1}</span><h4>{title}</h4><p>{displayBody}</p><small>{selectedProject.detail.actionMeta[index]}</small></article>;
                  })}
                </div>
              </section>
              <ul className="nextgen-stack-rail">{selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </main>
        </div>
      );
    }

    if (selectedProject.id === "platform") {
      const platformMetrics = language === "zh"
        ? [["3 条业务线", "采用同一套组件库"], ["8 种主题", "覆盖 4 套界面规范"]] as const
        : [["3 business lines", "adopted the shared library"], ["8 themes", "across 4 interface standards"]] as const;

      return (
        <div className="nextgen-deck platform-deck" key={selectedProject.id}>
          <header className="nextgen-deck-header">
            <div className="nextgen-deck-primary">
              <button className="back-link" onClick={returnHome}><span aria-hidden="true">←</span>{t.backToPortfolio}</button>
              <div className="nextgen-deck-controls">
                <LanguageSwitch />
                <nav aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
                  <span>{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
                  <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
                </nav>
              </div>
            </div>
          </header>

          <main className="nextgen-deck-main">
            <div className="nextgen-page nextgen-page--solution">
              <section className="nextgen-slide-hero">
                <div className="nextgen-hero-title">
                  <p>{language === "zh" ? "03 · 工程基础设施 / 共享组件库" : "03 · Engineering foundation / Shared UI library"}</p>
                  <h1>{selectedProject.title}</h1>
                  <strong>{selectedProject.detail.focus}</strong>
                  <span>{selectedProject.role}</span>
                </div>
                <aside className="nextgen-hero-context">
                  <p>{language === "zh" ? "项目背景" : "Project context"}</p>
                  <span>{selectedProject.detail.challenge}</span>
                  <strong>{selectedProject.detail.scope}</strong>
                </aside>
              </section>

              <section className="nextgen-results">
                <span>{language === "zh" ? "关键成果" : "Selected outcomes"}</span>
                <div className="nextgen-proof-strip nextgen-proof-strip--results">{platformMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
              </section>

              <section className="nextgen-contributions">
                <div className="nextgen-contributions-heading"><h3>{language === "zh" ? "我的核心贡献" : "Selected contributions"}</h3></div>
                <div className="nextgen-contribution-grid">
                  {selectedProject.detail.approach.map((item, index) => {
                    const [title, body = item] = item.split(/——| — /, 2);
                    const displayBody = body.charAt(0).toUpperCase() + body.slice(1);
                    return <article key={item}><span>0{index + 1}</span><h4>{title}</h4><p>{displayBody}</p><small>{selectedProject.detail.actionMeta[index]}</small></article>;
                  })}
                </div>
              </section>
              <ul className="nextgen-stack-rail">{selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </main>
        </div>
      );
    }

    const fushiMetrics = language === "zh"
      ? [["300+", "截至 2026 年 8 月累计用户"], ["已上线", "AI 辅食规划与健康记录投入真实使用"], ["90%+", "API 与 React 自动化测试覆盖"]] as const
      : [["300+", "cumulative users by Aug 2026"], ["Live", "AI planning and health tracking in production"], ["90%+", "automated API and React test coverage"]] as const;

    return (
      <div className="nextgen-deck fushi-deck" key={selectedProject.id}>
        <header className="nextgen-deck-header">
          <div className="nextgen-deck-primary">
            <button className="back-link" onClick={returnHome}><span aria-hidden="true">←</span>{t.backToPortfolio}</button>
            <div className="nextgen-deck-controls">
              <LanguageSwitch />
              <nav aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
                <span>{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
                <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
              </nav>
            </div>
          </div>
        </header>

        <main className="nextgen-deck-main">
          <div className="nextgen-page nextgen-page--solution">
            <section className="fushi-spotlight">
              <div className="fushi-spotlight-copy">
                <p>{language === "zh" ? "04 · 独立产品 / AI Agent" : "04 · Independent product / AI agent"}</p>
                <h1>{selectedProject.title}</h1>
                <strong>{language === "zh" ? "独立设计并上线一款已有 300+ 用户使用的 AI Agent 产品" : "Sole-built and launched a production AI agent used by 300+ users"}</strong>
                <p className="fushi-problem">{language === "zh" ? "把每日辅食安排、食材尝试记录和不适回溯放进同一套产品流程，并让 AI 只在明确的安全规则内提供帮助。" : "One product brings meal planning, food-introduction tracking and reaction history together, while allowing AI to act only within explicit safety rules."}</p>
                <span>{language === "zh" ? "独立全栈 / AI 工程师 · 覆盖产品、开发、测试、部署与线上排障" : "Independent Full-Stack / AI Engineer · Product, engineering, testing and production ownership"}</span>

                <div className="fushi-proof-cluster">
                  <div className="fushi-primary-proof"><strong>{fushiMetrics[0][0]}</strong><span>{fushiMetrics[0][1]}</span></div>
                  <div className="fushi-secondary-proof">
                    {fushiMetrics.slice(1).map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
                  </div>
                </div>
              </div>

              <section className="fushi-hero-gallery">
                <p>{language === "zh" ? "真实产品画面" : "Live product experience"}</p>
                <div className={`project-gallery gallery-view-${galleryView}`}>
                  <div className="gallery-frame"><img src={galleryImages[galleryView]} alt={t.galleryAlt[galleryView]} /></div>
                  <div className="gallery-controls" role="tablist" aria-label={language === "zh" ? "项目画面" : "Project screens"}>
                    {t.galleryTabs.map((tab, index) => (
                      <button key={tab} role="tab" aria-selected={galleryView === index} className={galleryView === index ? "active" : ""} onClick={() => setGalleryView(index as GalleryView)}>
                        <span>0{index + 1}</span>{tab}
                      </button>
                    ))}
                  </div>
                  <p className="gallery-caption">{t.galleryCaptions[galleryView]}</p>
                </div>
              </section>
            </section>

            <section className="fushi-contribution-section">
              <div className="nextgen-contributions-heading"><h3>{language === "zh" ? "AI 与全栈工程贡献" : "AI & full-stack engineering"}</h3></div>
              <div className="fushi-contribution-grid">
                {([0, 2, 1, 3] as const).map((itemIndex, visualIndex) => {
                  const item = selectedProject.detail.approach[itemIndex];
                  const [title, body = item] = item.split(/——| — /, 2);
                  const displayBody = body.charAt(0).toUpperCase() + body.slice(1);
                  const labels = language === "zh" ? ["AI-NATIVE WORKFLOW", "AI AGENT 安全", "全栈契约", "质量工程"] : ["AI-NATIVE WORKFLOW", "AI AGENT SAFETY", "FULL-STACK CONTRACTS", "QUALITY ENGINEERING"];
                  return <article className={visualIndex < 2 ? "featured" : "supporting"} key={item}><span>0{visualIndex + 1}</span><small>{labels[visualIndex]}</small><h4>{title}</h4><p>{displayBody}</p></article>;
                })}
              </div>
            </section>

            <div className="fushi-tech-footer">
              <ul className="nextgen-stack-rail">{selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <a href="https://github.com/Lsxj/fushi-dazi" target="_blank" rel="noreferrer">{selectedProject.link}<Arrow /></a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portfolio-shell">
      <aside className="profile-panel">
        <div>
          <a className="name" href="#about">{t.name}</a>
          <h1>{t.role}</h1>
          <p className="intro">{t.intro}</p>
          <p className="location">{t.location}</p>
          <nav aria-label={language === "zh" ? "主导航" : "Primary navigation"}>
            {t.nav.map((label, index) => <a href={`#${anchors[index]}`} key={label}><i /><span>{label}</span></a>)}
          </nav>
        </div>

        <div className="profile-footer">
          <LanguageSwitch />
          <div className="social-links">
            <a href="mailto:lsxj615@foxmail.com" aria-label="Email">Mail</a>
            <a href="https://github.com/Lsxj" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </aside>

      <main>
        <section id="about" className="about-section">
          <h2 className="mobile-section-title">{t.aboutTitle}</h2>
          {t.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="focus-line"><span>TypeScript</span><span>React</span><span>Node.js</span><span>Java</span><span>Cloud-native</span></div>
        </section>

        <section id="journey" className="journey-section">
          <h2 className="section-title">{t.journeyTitle}</h2>
          <p className="section-intro">{t.journeyIntro}</p>
          <div className="timeline">
            {t.journey.map((item, index) => (
              <article key={`${item.period}-${item.title}`}>
                <div className="timeline-marker"><i /><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div>
                  <time>{item.period}</time>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {item.stages.length > 0 && (
                    <div className="timeline-stages">
                      {item.stages.map(([label, title, body]) => <div key={label}><span>{label}</span><h4>{title}</h4><p>{body}</p></div>)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="projects-section">
          <div className="section-heading-row"><h2 className="section-title">{t.projectsTitle}</h2><p>{t.projectsHint}</p></div>
          <div className="project-list">
            {projects.map((project, projectIndex) => (
              <article className={`project project--${project.id}`} key={project.id}>
                <button className="project-card" onClick={() => showProject(projectIndex)} aria-label={`${t.openProject}: ${project.title}`}>
                  <div className="project-index">0{projectIndex + 1}</div>
                  <div className="project-card-body">
                    <p className="project-role">{project.role}</p>
                    <h3>{project.title}<Arrow /></h3>
                    <p className="project-summary">{project.body}</p>
                    <ul className="tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                  </div>
                  {project.id === "fushi" && <div className="project-thumb"><img src={galleryImages[0]} alt="" /></div>}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <p className="contact-kicker">{language === "zh" ? "保持联系" : "Get in touch"}</p>
          <h2>{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
          <div className="contact-links"><a href="mailto:lsxj615@foxmail.com">{t.email}<Arrow /></a><a href="https://github.com/Lsxj" target="_blank" rel="noreferrer">{t.source}<Arrow /></a></div>
        </section>

        <footer className="site-footer"><a href="/archive/">{t.archive}</a><span>{t.footer}</span></footer>
      </main>
    </div>
  );
}

export default App;
