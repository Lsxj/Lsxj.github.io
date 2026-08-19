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

function ActionPoint({ text }: { text: string }) {
  const parts = text.split(/——| — /, 2);
  if (parts.length < 2) return <p>{text}</p>;
  return <p><strong>{parts[0]}</strong><span>{parts[1]}</span></p>;
}

function CaseEvidence({ text, label }: { text: string; label: string }) {
  const parts = text.split(/——| — /, 2);
  return (
    <article className="case-evidence-row">
      <div><span>{label}</span><h3>{parts[0]}</h3></div>
      <p>{parts[1] ?? text}</p>
    </article>
  );
}

function EditorialAction({ text, meta, index }: { text: string; meta: string; index: number }) {
  const parts = text.split(/——| — /, 2);
  return (
    <article className="editorial-action-row">
      <span className="editorial-action-number">{String(index + 1).padStart(2, "0")}</span>
      <h3>{parts[0]}</h3>
      <div><p>{parts[1] ?? text}</p><small>{meta}</small></div>
    </article>
  );
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

    return (
      <div className={`project-detail-shell ${selectedProject.id === "fushi" ? "project-detail-shell--media" : selectedProject.id === "nextgen" ? "project-detail-shell--case-study project-detail-shell--nextgen" : selectedProject.id === "velocity" ? "project-detail-shell--case-study project-detail-shell--velocity" : "project-detail-shell--case-study project-detail-shell--library"}`} key={selectedProject.id}>
        <aside className="project-detail-panel">
          <div>
            <button className="back-link" onClick={returnHome}><span aria-hidden="true">←</span>{t.backToPortfolio}</button>
            <p className="detail-panel-label">{t.projectPageLabel} · {String(activeProject + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}</p>
            <h1>{selectedProject.title}</h1>
            <p className="detail-panel-role">{selectedProject.role}</p>
            <p className="detail-panel-context">{selectedProject.detail.challenge}</p>
            <div className={`detail-panel-stack${selectedProject.id === "fushi" ? " detail-panel-stack--fushi" : ""}`}>
                <span>STACK</span>
                <ul>{selectedProject.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                {selectedProject.id === "fushi" && (
                  <a className="detail-panel-source" href="https://github.com/Lsxj/fushi-dazi" target="_blank" rel="noreferrer">{selectedProject.link}<Arrow /></a>
                )}
            </div>
          </div>
          <div className="detail-panel-footer"><LanguageSwitch /><a href="mailto:lsxj615@foxmail.com">Mail</a><a href="https://github.com/Lsxj" target="_blank" rel="noreferrer">GitHub</a></div>
        </aside>

        <main className="project-detail-main">
          <nav className="detail-slide-controls" aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
            <span>{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
            <div className="slide-dots" aria-hidden="true">{projects.map((project, index) => <i className={index === activeProject ? "active" : ""} key={project.id} />)}</div>
            <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
            <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
          </nav>
          {selectedProject.id !== "fushi" ? (
            <section className="case-study-intro">
              <p>{t.detailLabels.ownership}</p>
              <h2>{selectedProject.detail.focus}</h2>
              <span>{selectedProject.detail.scope}</span>
            </section>
          ) : (
            <div className="project-narrative">
              <p className="narrative-ownership">{selectedProject.detail.ownership}</p>
            </div>
          )}

          {selectedProject.id === "fushi" && (
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
          )}

          {selectedProject.id === "nextgen" ? (
            <div className="enterprise-case">
              <section className="enterprise-architecture">
                <span>{language === "zh" ? "01 · 核心全栈实现" : "01 · Full-stack delivery"}</span>
                <h3>{selectedProject.detail.architectureTitle}</h3>
                <p>{selectedProject.detail.architectureSummary}</p>
                <div className="architecture-flow">
                  {selectedProject.detail.architectureNodes.map((node, index) => (
                    <div className="architecture-node" key={node[0]}>
                      <strong>{node[0]}</strong>
                      <p>{node[1]}</p>
                      {index === 0 && <i aria-hidden="true">↔</i>}
                    </div>
                  ))}
                </div>
              </section>
              <div className="enterprise-evidence">
                <CaseEvidence text={selectedProject.detail.approach[2]} label={language === "zh" ? "02 · 数据驱动迁移" : "02 · Data-driven migration"} />
                <CaseEvidence text={selectedProject.detail.approach[3]} label={language === "zh" ? "03 · 授权与安全门禁" : "03 · Authorization & security"} />
              </div>
            </div>
          ) : selectedProject.id === "velocity" ? (
            <div className="velocity-action-list">
              {selectedProject.detail.approach.map((item, index) => (
                <EditorialAction text={item} meta={selectedProject.detail.actionMeta[index]} index={index} key={item} />
              ))}
            </div>
          ) : selectedProject.id === "platform" ? (
            <div className="library-action-list">
              {selectedProject.detail.approach.map((item, index) => (
                <EditorialAction text={item} meta={selectedProject.detail.actionMeta[index]} index={index} key={item} />
              ))}
            </div>
          ) : (
            <div className={`project-actions project-actions--${selectedProject.detail.approach.length}`}>
              {selectedProject.detail.approach.map((item) => <ActionPoint text={item} key={item} />)}
            </div>
          )}
          <section className="project-outcome-slide" aria-label={t.detailLabels.impact}>
            <p>{t.detailLabels.impact}</p>
            <div className="outcome-editorial">
              <div className="outcome-primary"><strong>{selectedProject.outcomes[0][0]}</strong><span>{selectedProject.outcomes[0][1]}</span></div>
              <div className="outcome-support">
                <h2>{selectedProject.outcomeStatement}</h2>
                <p>{selectedProject.outcomes[1][1]}</p>
                <div><span>{selectedProject.outcomes[2][1]}</span><strong>{selectedProject.outcomes[2][0]}</strong></div>
              </div>
            </div>
          </section>

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
