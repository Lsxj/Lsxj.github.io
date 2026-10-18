import { useEffect, useState } from "react";
import { content, type Language } from "./content";

type FushiSection = "overview" | "agent" | "fullstack";
type NextgenSection = "overview" | "scope" | "backend" | "frontend" | "production" | "result";

function initialLanguage(): Language {
  const stored = window.localStorage.getItem("portfolio-language");
  if (stored === "en" || stored === "zh") return stored;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

const anchors = ["about", "journey", "projects", "contact"];
const projectIds = ["nextgen", "fushi", "velocity", "platform"];
const PROJECT_DETAILS_ENABLED: boolean = false;
const fushiSections: FushiSection[] = ["overview", "agent", "fullstack"];
const nextgenSections: NextgenSection[] = ["overview", "scope", "backend", "frontend", "production", "result"];
const galleryImages = ["/assets/fushi-overview.jpg", "/assets/fushi-pain-points.jpg", "/assets/fushi-home-guide.jpg", "/assets/fushi-support.jpg"];

function projectFromUrl() {
  if (!PROJECT_DETAILS_ENABLED && !isPresentationUrl()) return null;
  const id = new URLSearchParams(window.location.search).get("project");
  if (isPresentationUrl() && id !== "nextgen") return null;
  const index = id ? projectIds.indexOf(id) : -1;
  return index >= 0 ? index : null;
}

function fushiSectionFromUrl(): FushiSection {
  const section = new URLSearchParams(window.location.search).get("section");
  return fushiSections.includes(section as FushiSection) ? section as FushiSection : "overview";
}

function nextgenSectionFromUrl(): NextgenSection {
  const section = new URLSearchParams(window.location.search).get("section");
  return nextgenSections.includes(section as NextgenSection) ? section as NextgenSection : "overview";
}

function isPresentationUrl() {
  return new URLSearchParams(window.location.search).get("view") === "present";
}

function routeUrl(params: Record<string, string>) {
  const search = new URLSearchParams();
  if (isPresentationUrl()) search.set("view", "present");
  Object.entries(params).forEach(([key, value]) => search.set(key, value));
  return `${window.location.pathname}?${search.toString()}`;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [activeProject, setActiveProject] = useState<number | null>(projectFromUrl);
  const [fushiSection, setFushiSection] = useState<FushiSection>(fushiSectionFromUrl);
  const [nextgenSection, setNextgenSection] = useState<NextgenSection>(nextgenSectionFromUrl);
  const [whyRole, setWhyRole] = useState(() => new URLSearchParams(window.location.search).get("section") === "why-role");
  const t = content[language];
  const projects = [...t.projects].sort((a, b) => projectIds.indexOf(a.id) - projectIds.indexOf(b.id));
  const selectedProject = activeProject === null ? null : projects[activeProject];
  const presentationMode = isPresentationUrl();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("project");
    if (presentationMode && id && id !== "nextgen") {
      window.history.replaceState(null, "", `${window.location.pathname}?view=present`);
      return;
    }
    if (PROJECT_DETAILS_ENABLED || presentationMode || !id) return;
    window.history.replaceState(null, "", presentationMode ? `${window.location.pathname}?view=present` : window.location.pathname);
  }, [presentationMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!presentationMode || selectedProject?.id !== "nextgen" || params.get("section") !== "solution") return;
    window.history.replaceState({ portfolioProject: true, nextgenSection: true }, "", routeUrl({ project: "nextgen", section: "overview" }));
    setNextgenSection("overview");
  }, [presentationMode, selectedProject?.id]);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    const fushiPageTitle = language === "zh"
      ? { overview: "产品与成果", agent: "Agent 与 MCP", fullstack: "生产反馈闭环" }[fushiSection]
      : { overview: "Product & Impact", agent: "Agent & MCP", fullstack: "Production Feedback" }[fushiSection];
    const nextgenPageTitle = language === "zh"
      ? { overview: "项目概览", scope: "职责与贡献", backend: "后端与数据", frontend: "前端平台", production: "安全与生产工程", result: "项目成果" }[nextgenSection]
      : { overview: "Project Overview", scope: "My Ownership", backend: "Backend & Data", frontend: "Frontend Platform", production: "Security & Production", result: "Result" }[nextgenSection];
    document.title = selectedProject
      ? `${selectedProject.title}${selectedProject.id === "fushi" ? ` · ${fushiPageTitle}` : selectedProject.id === "nextgen" ? ` · ${nextgenPageTitle}` : ""} — ${t.name}`
      : presentationMode
        ? `${t.name} — ${language === "zh" ? "面试展示" : "Interview Presentation"}`
        : `${t.name} — ${t.role}`;
    window.localStorage.setItem("portfolio-language", language);
  }, [activeProject, fushiSection, language, nextgenSection, presentationMode, selectedProject, t.name, t.role]);

  useEffect(() => {
    const syncRoute = () => {
      setWhyRole(new URLSearchParams(window.location.search).get("section") === "why-role");
      setActiveProject(projectFromUrl());
      setFushiSection(fushiSectionFromUrl());
      setNextgenSection(nextgenSectionFromUrl());
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeProject, fushiSection, nextgenSection]);

  useEffect(() => {
    if (!presentationMode) return;
    const navigatePresentation = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      movePresentation(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", navigatePresentation);
    return () => window.removeEventListener("keydown", navigatePresentation);
  }, [activeProject, fushiSection, nextgenSection, presentationMode, whyRole]);

  function showProject(index: number, replace = false) {
    if (!PROJECT_DETAILS_ENABLED && !presentationMode) return;
    if (presentationMode && projectIds[index] !== "nextgen") return;
    const url = routeUrl({ project: projectIds[index] });
    if (replace) window.history.replaceState({ portfolioProject: true }, "", url);
    else window.history.pushState({ portfolioProject: true }, "", url);
    setFushiSection("overview");
    setNextgenSection("overview");
    setActiveProject(index);
  }

  function showFushiSection(section: FushiSection, replace = false) {
    const url = routeUrl({ project: "fushi", section });
    if (replace) window.history.replaceState({ portfolioProject: true, fushiSection: true }, "", url);
    else window.history.pushState({ portfolioProject: true, fushiSection: true }, "", url);
    setFushiSection(section);
  }

  function showNextgenSection(section: NextgenSection, replace = false) {
    const url = routeUrl({ project: "nextgen", section });
    if (replace) window.history.replaceState({ portfolioProject: true, nextgenSection: true }, "", url);
    else window.history.pushState({ portfolioProject: true, nextgenSection: true }, "", url);
    setNextgenSection(section);
  }

  function returnHome() {
    setWhyRole(false);
    window.history.replaceState(null, "", presentationMode ? `${window.location.pathname}?view=present` : window.location.pathname);
    setActiveProject(null);
    setFushiSection("overview");
    setNextgenSection("overview");
  }

  function LanguageSwitch() {
    if (presentationMode) return null;
    return (
      <div className="language-switch" aria-label={language === "zh" ? "语言选择" : "Language selection"}>
        <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
        <span>/</span>
        <button className={language === "zh" ? "active" : ""} onClick={() => setLanguage("zh")} aria-pressed={language === "zh"}>中</button>
      </div>
    );
  }

  function showPresentationPage(project: "intro" | "nextgen" | "fushi" | "why-role", section?: NextgenSection | FushiSection) {
    setWhyRole(project === "why-role");
    if (project === "why-role") {
      window.history.pushState(null, "", routeUrl({ section: "why-role" }));
      setActiveProject(null);
      return;
    }
    if (project === "intro") {
      returnHome();
      return;
    }

    const projectIndex = projectIds.indexOf(project);
    const targetSection = section ?? "overview";
    window.history.pushState(
      { portfolioProject: true, presentationSection: true },
      "",
      routeUrl({ project, section: targetSection }),
    );
    setActiveProject(projectIndex);
    if (project === "nextgen") setNextgenSection(targetSection as NextgenSection);
    if (project === "fushi") setFushiSection(targetSection as FushiSection);
  }

  function movePresentation(direction: -1 | 1) {
    const sequence: Array<{ project: "intro" | "nextgen" | "fushi" | "why-role"; section?: NextgenSection | FushiSection }> = [
      { project: "intro" },
      { project: "why-role" },
      ...nextgenSections.map((section) => ({ project: "nextgen" as const, section })),
    ];
    const currentIndex = whyRole && activeProject === null ? 1 : activeProject === null
      ? 0
      : selectedProject?.id === "nextgen"
        ? 2 + nextgenSections.indexOf(nextgenSection)
        : -1;
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0) return;
    const target = sequence[nextIndex >= sequence.length ? 0 : nextIndex];
    showPresentationPage(target.project, target.section);
  }

  function PresentationDock() {
    if (!presentationMode) return null;
    const nextgenLabels = language === "zh"
      ? ["项目概览", "职责与贡献", "后端与数据", "前端平台", "安全与生产", "项目成果"]
      : ["Overview", "Ownership", "Backend", "Frontend", "Production", "Result"];


    return (
      <div className="presentation-dock-zone">
        <nav className="presentation-dock" aria-label={language === "zh" ? "演示页面快速导航" : "Presentation page shortcuts"}>
          <span className="presentation-dock-handle" aria-hidden="true" />
          <button
            className={activeProject === null && !whyRole ? "active" : ""}
            aria-current={activeProject === null && !whyRole ? "page" : undefined}
            onClick={() => showPresentationPage("intro")}
          >
            <strong>{language === "zh" ? "自我介绍" : "Introduction"}</strong>
          </button>
          <button className={activeProject === null && whyRole ? "active" : ""} aria-current={activeProject === null && whyRole ? "page" : undefined} onClick={() => showPresentationPage("why-role")}><strong>{language === "zh" ? "为什么选择这个岗位" : "Why this role"}</strong></button>
          <div className="presentation-dock-group">
            <span>CitiDirect</span>
            <div>
              {nextgenSections.map((section, index) => (
                <button
                  key={section}
                  className={selectedProject?.id === "nextgen" && nextgenSection === section ? "active" : ""}
                  aria-current={selectedProject?.id === "nextgen" && nextgenSection === section ? "page" : undefined}
                  aria-label={`CitiDirect ${String(index + 1).padStart(2, "0")}: ${nextgenLabels[index]}`}
                  title={nextgenLabels[index]}
                  onClick={() => showPresentationPage("nextgen", section)}
                >{String(index + 1).padStart(2, "0")}</button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    );
  }

  if (presentationMode && activeProject === null && whyRole) {
    return <div className="presentation-shell">
      <header className="presentation-header"><div><span>Apple Enterprise Systems</span></div><div className="presentation-controls"><LanguageSwitch /></div></header>
      <main className="presentation-main"><section className="why-role-slide" aria-labelledby="why-role-title">
        <div className="why-role-heading"><h1 id="why-role-title">{language === "zh" ? "为什么选择这个岗位" : "Why this role"}</h1></div>
        <div className="why-role-message">
          <h2>{language === "zh" ? <>把复杂的业务需求，<br />做成好用的产品。</> : <>Turn complex business needs<br />into products people can use.</>}</h2>
        </div>
        <div className="role-motivations">
          {(language === "zh" ? [
            ["延续企业应用经验", "把在 Citi 积累的复杂权限与业务流程经验带到新的团队。"],
            ["参与端到端交付", "从用户需求到界面、服务与数据层，继续亲自参与实现。"],
            ["深入新的业务领域", "与业务伙伴紧密合作，理解企业系统如何支持日常运营。"]
          ] : [
            ["Build on my experience", "Bring my experience with complex permissions and enterprise workflows at Citi."],
            ["Deliver end to end", "Stay hands-on across the UI, services and data layers."],
            ["Learn a new domain", "Work closely with business partners to understand how their operations work."]
          ]).map(([title, description], index) => <section key={title}><span className="role-motivation-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p></section>)}
        </div>
      <footer className="presentation-intro-footer why-role-pager"><button onClick={() => showPresentationPage("intro")} aria-label={language === "zh" ? "返回自我介绍" : "Back to Introduction"}><span aria-hidden="true">←</span>{language === "zh" ? "自我介绍" : "Introduction"}</button><button onClick={() => showProject(0)} aria-label="Open CitiDirect presentation">CitiDirect<span aria-hidden="true">→</span></button></footer></section></main><PresentationDock />
    </div>;
  }

  if (presentationMode && activeProject === null) {
    return (
      <div className="presentation-shell">
        <header className="presentation-header">
          <div>
            <span>{language === "zh" ? "自我介绍" : "Introduction"}</span>
          </div>
          <div className="presentation-controls">
            <LanguageSwitch />
          </div>
        </header>

        <main className="presentation-main">
          <section className="presentation-intro intro-cover" aria-labelledby="presentation-name">
            <div className="intro-cover-copy">
              <h1 id="presentation-name">{t.name}</h1>
              <p className="intro-cover-role">{language === "zh" ? "高级全栈工程师 · 九年花旗经历" : "Senior Full-Stack Engineer · Nine years at Citi"}</p>
              <h2>{language === "zh" ? <>构建贯穿<span className="intro-cover-emphasis">界面、服务与数据层</span>的企业应用。</> : <>Building enterprise applications across <span className="intro-cover-emphasis">UI, services and data.</span></>}</h2>
              <p className="intro-cover-approach">{language === "zh" ? "从理解用户需求到生产交付，我始终亲自参与。" : "I stay hands-on, from understanding user needs to production delivery."}</p>
            </div>
            <div className="intro-work"><p>{language === "zh" ? "项目经历" : "Selected work"}</p><ul aria-label={language === "zh" ? "项目经历" : "Selected work"}>
              <li>Citi Velocity</li>
              <li>{language === "zh" ? "企业 React 组件库" : "Enterprise React Library"}</li>
              <li className="intro-work-featured">CitiDirect Entitlements</li>
              <li>NutriFlow AI</li>
            </ul></div>

            <footer className="presentation-intro-footer">
              <button onClick={() => showPresentationPage("why-role")} aria-label="Open Why this role">Why this role<span aria-hidden="true">→</span></button>
            </footer>
          </section>
        </main>
        <PresentationDock />
      </div>
    );
  }

  if (selectedProject && activeProject !== null) {
    const previousIndex = (activeProject - 1 + projects.length) % projects.length;
    const nextIndex = (activeProject + 1) % projects.length;

    if (selectedProject.id === "nextgen") {
      const nextgenCaseLabels = language === "zh"
        ? ["项目概览", "职责与贡献", "后端与数据", "前端平台", "安全与生产工程", "项目成果"]
        : ["Overview", "My Ownership", "Backend & Data", "Frontend Platform", "Security & Production", "Result"];
      const currentCaseIndex = nextgenSections.indexOf(nextgenSection);
      const caseNavigation = (
        <nav className="fushi-case-nav nextgen-case-nav" aria-label={language === "zh" ? "CitiDirect 案例分页" : "CitiDirect case study pages"}>
          <span>{language === "zh" ? `案例页 ${String(currentCaseIndex + 1).padStart(2, "0")} / ${String(nextgenSections.length).padStart(2, "0")}` : `Case page ${String(currentCaseIndex + 1).padStart(2, "0")} / ${String(nextgenSections.length).padStart(2, "0")}`}</span>
          <div>
            {nextgenSections.map((section, index) => (
              <button key={section} className={nextgenSection === section ? "active" : ""} aria-current={nextgenSection === section ? "page" : undefined} onClick={() => showNextgenSection(section)}>
                <span>0{index + 1}</span>{nextgenCaseLabels[index]}
              </button>
            ))}
          </div>
        </nav>
      );
      const casePager = (
        <nav className="fushi-case-pager nextgen-case-pager" aria-label={language === "zh" ? "CitiDirect 案例页前后导航" : "CitiDirect case page navigation"}>
          {currentCaseIndex > 0
            ? <button onClick={() => showNextgenSection(nextgenSections[currentCaseIndex - 1])}><span aria-hidden="true">←</span><small>{language === "zh" ? "上一页" : "Previous"}</small><strong>{nextgenCaseLabels[currentCaseIndex - 1]}</strong></button>
            : <button onClick={() => showPresentationPage("why-role")}><span aria-hidden="true">←</span><strong>Why this role</strong></button>}
          {currentCaseIndex < nextgenSections.length - 1
            ? <button className="next" onClick={() => showNextgenSection(nextgenSections[currentCaseIndex + 1])}><small>{language === "zh" ? "下一页" : "Next"}</small><strong>{nextgenCaseLabels[currentCaseIndex + 1]}</strong><span aria-hidden="true">→</span></button>
            : <button className="next" onClick={returnHome}><strong>{language === "zh" ? "返回自我介绍" : "Return to introduction"}</strong><span aria-hidden="true">↺</span></button>}
        </nav>
      );

      return (
        <div className={`nextgen-deck${presentationMode ? " nextgen-deck--presentation" : ""}`} key={selectedProject.id}>
          <header className="nextgen-deck-header">
            <div className="nextgen-deck-primary">
              <div className="nextgen-deck-controls">
                <LanguageSwitch />
                <nav aria-label={language === "zh" ? "演示导航" : "Presentation navigation"}>
                  <button onClick={returnHome}>{language === "zh" ? "自我介绍" : "Introduction"}</button>
                  <button onClick={() => showPresentationPage("why-role")}>{language === "zh" ? "为什么选择这个岗位" : "Why this role"}</button>
                </nav>
              </div>
            </div>

          </header>

          <main className="nextgen-deck-main">
            <div className={`nextgen-page nextgen-page--solution nextgen-case-page nextgen-case-page--${nextgenSection}`}>
              {caseNavigation}

              {nextgenSection === "overview" && (
                <section className="citi-overview-slide">
                  <div className="citi-overview-top">
                  <header className="citi-overview-heading">
                    <p className="citi-overview-label">{language === "zh" ? "01 / 项目概览" : "01 / Project overview"}</p>
                    <h1>CitiDirect Nextgen Entitlements</h1>
                    <p className="citi-overview-description">{language === "zh" ? "花旗企业数字银行中的权限管理模块，管理企业客户及其用户的访问权限。" : "Access management for corporate clients and their users within Citi’s digital banking platform."}</p>
                    <p className="citi-overview-role">{selectedProject.role}</p>
                  </header>
                  <aside className="citi-overview-scale" aria-label={language === "zh" ? "CitiDirect 平台规模" : "CitiDirect platform scale"}>
                    <p>{language === "zh" ? "CitiDirect 平台规模" : "CitiDirect platform scale"}</p>
                    <div><strong>90K+</strong><span>{language === "zh" ? "家机构" : "organizations"}</span></div>
                    <div><strong>90+</strong><span>{language === "zh" ? "个市场" : "markets"}</span></div>
                  </aside>
                  </div>
                  <div className="citi-overview-changes">
                    <div className="citi-overview-table-head"><span>{language === "zh" ? "原有业务问题" : "Business challenge"}</span><span>{language === "zh" ? "Nextgen 的改进" : "What changed in Nextgen"}</span></div>
                    <article><h2>{language === "zh" ? "权限配置复杂" : "Complex access setup"}</h2><div><h3>{language === "zh" ? "可复用的权限组合（Persona）" : "Reusable permission sets (personas)"}</h3><p>{language === "zh" ? "将权限组织为可复用组合，用于用户权限分配。" : "Group permissions into reusable sets for user access assignment."}</p></div></article>
                    <article><h2>{language === "zh" ? "企业实体接入依赖人工" : "Manual legal-entity onboarding"}</h2><div><h3>{language === "zh" ? "事件驱动的接入流程" : "Event-driven onboarding"}</h3><p>{language === "zh" ? "通过系统事件触发接入，以独立控制流程创建初始用户。" : "Trigger initial user creation through system events and a separate control path."}</p></div></article>
                  </div>

                </section>
              )}

              {nextgenSection === "scope" && (
                <section className="citi-scope-slide">
                  <header className="ownership-intro">
                    <p className="citi-overview-label">{language === "zh" ? "02 / 我的职责" : "02 / My ownership"}</p>
                    <h1>{language === "zh" ? "技术负责人，也是核心开发者" : "Tech Lead & hands-on engineer"}</h1>
                    <p>{language === "zh" ? "带领 10+ 人中印团队，与其他五个团队共同建设 Entitlements。" : "Led 10+ engineers across China and India, working with five other teams."}</p>
                  </header>
                  <div className="ownership-columns">
                    <section>
                      <h2>{language === "zh" ? "亲自实现" : "Hands-on engineering"}</h2>
                      <ul>
                        <li><h3>Core User Service</h3><p>{language === "zh" ? "用户生命周期与权限管理。" : "User lifecycle and access management."}</p></li>
                        <li><h3>{language === "zh" ? "权限管理流程" : "Permission management workflow"}</h3><p>{language === "zh" ? "用户维护、Persona 分配与审批操作。" : "User maintenance, persona assignment and approvals."}</p></li>
                        <li><h3>{language === "zh" ? "协作实现相关服务" : "Contributed to related services"}</h3><p>{language === "zh" ? "Persona、Criteria、CDC、审计及下游权限配置。" : "Persona, Criteria, CDC, Audit and provisioning."}</p></li>
                      </ul>
                    </section>
                    <section>
                      <h2>{language === "zh" ? "技术领导与交付" : "Technical leadership"}</h2>
                      <ul>
                        <li><h3>{language === "zh" ? "跨团队设计" : "Cross-team design"}</h3><p>{language === "zh" ? "共同设计领域模型与 API 契约。" : "Co-designed domain models and API contracts."}</p></li>
                        <li><h3>{language === "zh" ? "团队交付" : "Team delivery"}</h3><p>{language === "zh" ? "负责用户与权限管理流程的集成及发布。" : "Led integration and releases for the user and access workflow."}</p></li>
                        <li><h3>{language === "zh" ? "生产支持" : "Production support"}</h3><p>{language === "zh" ? "带领团队跟进上线后的生产问题。" : "Led the team through post-release production support."}</p></li>
                      </ul>
                    </section>
                  </div>
                </section>
              )}

              {nextgenSection === "backend" && (
                <section className="citi-backend-slide">
                  <header className="ownership-intro">
                    <p className="citi-overview-label">{language === "zh" ? "03 / 后端与数据" : "03 / Backend & data"}</p>
                    <h1>{language === "zh" ? "跨系统的用户与权限管理" : "User and access management across systems"}</h1>
                  </header>

                  <figure className="citi-backend-diagram">
                    <img src={language === "zh" ? "/assets/nextgen-architecture-zh.svg?v=43" : "/assets/nextgen-architecture-en.svg?v=43"} alt={language === "zh" ? "CRM 事件与用户操作进入核心 User Service；数据库变更经 CDC 和 Kafka 传播至审计及下游权限配置服务。" : "CRM events and user actions reach the Core User Service; database changes propagate through CDC and Kafka to audit and downstream provisioning."} />
                    <figcaption>{language === "zh" ? "简化的非保密架构 · 实线：请求或写入 · 虚线：事件传播" : "Simplified, non-confidential view · Solid: requests or writes · Dashed: events"}</figcaption>
                  </figure>

                </section>
              )}

              {nextgenSection === "frontend" && (
                <section className="citi-frontend-slide">
                  <header className="ownership-intro">
                    <p className="citi-overview-label">{language === "zh" ? "04 / 前端平台" : "04 / Frontend platform"}</p>
                    <h1>{language === "zh" ? "Schema 驱动界面，模块化交付" : "Schema-driven UI and modular delivery"}</h1>
                  </header>
                  <div className="citi-frontend-summary">
                    <p>{language === "zh" ? "Persona 元数据与布局配置驱动界面，复用同一套渲染引擎。" : "Persona metadata and layout drive the UI through a shared rendering engine."}</p>

                  </div>
                  <figure className="nextgen-frontend-architecture-image" aria-label={language === "zh" ? "动态 Persona UI 与 Module Federation 架构" : "Dynamic persona UI and Module Federation architecture"}>
                    <img
                      src={language === "zh" ? "/assets/nextgen-frontend-architecture-zh.svg?v=15" : "/assets/nextgen-frontend-architecture-en.svg?v=15"}
                      alt={language === "zh" ? "Schema Lens 动态渲染与一个 Host、四个 Remote 应用的 Module Federation 架构" : "Schema Lens dynamic rendering and a Module Federation architecture with one host and four remote applications"}
                    />
                    <figcaption className="sr-only">
                      <span>Schema Lens</span><span>Persona Service</span><span>Criteria Service</span><span>Host</span><span>Webpack Module Federation</span><span>Nginx</span>
                    </figcaption>
                  </figure>
                </section>
              )}

              {nextgenSection === "production" && (
                <section className="citi-production-slide">
                  <header className="ownership-intro">
                    <p className="citi-overview-label">{language === "zh" ? "05 / 安全与生产工程" : "05 / Security & production"}</p>
                    <h1>{language === "zh" ? "从发布前验证到生产支持" : "From release checks to production support"}</h1>
                  </header>
                  <div className="production-stages">
                    <section>
                      <span className="production-step">01 / {language === "zh" ? "发布前" : "Before release"}</span>
                      <h2>{language === "zh" ? "质量与安全检查" : "Quality & security"}</h2>
                      <p>{language === "zh" ? "安全扫描与业务流程测试集成到 CI/CD。" : "Security scans and workflow tests in CI/CD."}</p>
                      <p className="production-coverage"><strong>90%+</strong><span>{language === "zh" ? "团队服务测试覆盖率" : "test coverage across team services"}</span></p>
                    </section>
                    <section>
                      <span className="production-step">02 / {language === "zh" ? "发布中" : "During release"}</span>
                      <h2>{language === "zh" ? "部署与回滚准备" : "Deployment safeguards"}</h2>
                      <p>{language === "zh" ? "健康检查、部署验证与回滚准备。" : "Health checks, deployment verification and rollback preparation."}</p>
                    </section>
                    <section>
                      <span className="production-step">03 / {language === "zh" ? "上线后" : "In production"}</span>
                      <h2>{language === "zh" ? "跨服务问题定位" : "Cross-service diagnosis"}</h2>
                      <p>{language === "zh" ? "通过请求 ID 与结构化日志定位跨服务故障。" : "Trace failures across services with request IDs and structured logs."}</p>
                    </section>
                  </div>
                  <div className="production-transition">
                    <h2>{language === "zh" ? "分阶段迁移" : "Phased migration"}</h2>
                    <p>{language === "zh" ? "新旧权限模型并行，分批转换与验证。" : "Legacy and new models coexisted, with staged conversion and validation."}</p>
                  </div>
                </section>
              )}

              {nextgenSection === "result" && (
                <section className="citi-result-slide">
                  <header className="ownership-intro">
                    <p className="citi-overview-label">{language === "zh" ? "06 / 项目成果" : "06 / Result"}</p>
                    <h1>{language === "zh" ? "上线后的业务成果" : "Outcomes in production"}</h1>
                  </header>
                  <div className="citi-result-points">
                    <article>
                      <p className="citi-result-label">{language === "zh" ? "01 / 用户管理" : "01 / User administration"}</p>
                      <h2>{language === "zh" ? "完整的用户管理流程" : "Complete user lifecycle"}</h2>
                      <p>{language === "zh" ? "贯通用户变更、审批与拒绝，以及下游权限同步。" : "Connected user changes, checker decisions and entitlement sync."}</p>
                    </article>
                    <article>
                      <p className="citi-result-label">{language === "zh" ? "02 / 客户接入" : "02 / Client onboarding"}</p>
                      <h2>{language === "zh" ? "减少人工设置" : "Less manual setup"}</h2>
                      <p>{language === "zh" ? "CRM 事件自动触发 Legal Entity、用户与权限开通。" : "CRM events triggered legal entity, user and entitlement provisioning."}</p>
                    </article>
                  </div>
                  <div className="citi-result-award">
                    <span>{language === "zh" ? "个人荣誉 / 2024" : "Individual recognition / 2024"}</span>
                    <p>Citi Gratitude <strong>Golden Award</strong></p>
                  </div>
                </section>
              )}

              {casePager}
            </div>
          </main>
          <PresentationDock />
        </div>
      );
    }

    if (selectedProject.id === "velocity") {
      const velocityMetrics = language === "zh"
        ? [["≈60%", "首屏等待与白屏时间降幅"], ["端到端", "Typeahead 至完整搜索结果页"], ["Golden + Silver", "2019 / 2021 Citi Gratitude Awards"], ["技术分享", "公司级工程大会演讲"]] as const
        : [["≈60%", "less initial wait and blank-screen time"], ["End-to-end", "typeahead through the complete results page"], ["Golden + Silver", "2019 / 2021 Citi Gratitude Awards"], ["Tech talk", "company-wide engineering conference"]] as const;

      return (
        <div className={`nextgen-deck velocity-deck${presentationMode ? " nextgen-deck--presentation" : ""}`} key={selectedProject.id}>
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
                  <p>{language === "zh" ? "03 · 核心项目 / 机构搜索与前端现代化" : "03 · Core project / Institutional search"}</p>
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
          <PresentationDock />
        </div>
      );
    }

    if (selectedProject.id === "platform") {
      const platformMetrics = language === "zh"
        ? [["3 条业务线", "采用同一套组件库"], ["8 种主题", "覆盖 4 套界面规范"]] as const
        : [["3 business lines", "adopted the shared library"], ["8 themes", "across 4 interface standards"]] as const;

      return (
        <div className={`nextgen-deck platform-deck${presentationMode ? " nextgen-deck--presentation" : ""}`} key={selectedProject.id}>
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
                  <p>{language === "zh" ? "04 · 工程基础设施 / 共享组件库" : "04 · Engineering foundation / Shared UI library"}</p>
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
          <PresentationDock />
        </div>
      );
    }

    const fushiCaseLabels = language === "zh"
      ? ["产品与成果", "Agent 与 MCP", "生产反馈闭环"]
      : ["Product & Impact", "Agent & MCP", "Production Feedback"];
    const currentCaseIndex = fushiSections.indexOf(fushiSection);
    const contribution = (index: number) => {
      const item = selectedProject.detail.approach[index];
      const [title, body = item] = item.split(/——| — /, 2);
      return { title, body: body.charAt(0).toUpperCase() + body.slice(1) };
    };
    const caseNavigation = (
      <nav className="fushi-case-nav" aria-label={language === "zh" ? "NutriFlow AI 案例分页" : "NutriFlow AI case study pages"}>
        <span>{language === "zh" ? `展示页 ${String(currentCaseIndex + 1).padStart(2, "0")} / 03` : `Presentation page ${String(currentCaseIndex + 1).padStart(2, "0")} / 03`}</span>
        <div>
          {fushiSections.map((section, index) => (
            <button key={section} className={fushiSection === section ? "active" : ""} aria-current={fushiSection === section ? "page" : undefined} onClick={() => showFushiSection(section)}>
              <span>0{index + 1}</span>{fushiCaseLabels[index]}
            </button>
          ))}
        </div>
      </nav>
    );
    const casePager = (
      <nav className="fushi-case-pager" aria-label={language === "zh" ? "案例页前后导航" : "Case page navigation"}>
        {currentCaseIndex > 0
          ? <button onClick={() => showFushiSection(fushiSections[currentCaseIndex - 1])}><span aria-hidden="true">←</span><small>{language === "zh" ? "上一页" : "Previous"}</small><strong>{fushiCaseLabels[currentCaseIndex - 1]}</strong></button>
          : <button onClick={() => showProject(previousIndex, true)}><span aria-hidden="true">←</span><small>{language === "zh" ? "上一项目" : "Previous project"}</small><strong>CitiDirect Nextgen Entitlements</strong></button>}
        {currentCaseIndex < fushiSections.length - 1
          ? <button className="next" onClick={() => showFushiSection(fushiSections[currentCaseIndex + 1])}><small>{language === "zh" ? "下一页" : "Next"}</small><strong>{fushiCaseLabels[currentCaseIndex + 1]}</strong><span aria-hidden="true">→</span></button>
          : <button className="next" onClick={returnHome}><small>{language === "zh" ? "返回" : "Return to"}</small><strong>{language === "zh" ? "自我介绍" : "Introduction"}</strong><span aria-hidden="true">↺</span></button>}
      </nav>
    );

    return (
      <div className={`nextgen-deck fushi-deck${presentationMode ? " nextgen-deck--presentation" : ""}`} key={selectedProject.id}>
        <header className="nextgen-deck-header">
          <div className="nextgen-deck-primary">
            <div className="nextgen-deck-controls">
              <LanguageSwitch />
              <nav aria-label={language === "zh" ? "项目切换" : "Project navigation"}>
                <span>{language === "zh" ? "项目 " : "Project "}{String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                <button onClick={() => showProject(previousIndex, true)} aria-label={`${t.previousProject}: ${projects[previousIndex].title}`} title={t.previousProject}>←</button>
                <button onClick={() => showProject(nextIndex, true)} aria-label={`${t.nextProject}: ${projects[nextIndex].title}`} title={t.nextProject}>→</button>
              </nav>
            </div>
          </div>
        </header>

        <main className="nextgen-deck-main">
          <div className={`nextgen-page nextgen-page--solution fushi-case-page fushi-case-page--${fushiSection}`}>
            {caseNavigation}

            {fushiSection === "overview" && (
              <section className="fushi-overview">
                <div className="fushi-spotlight-copy">
                  <p>{language === "zh" ? "01 / 产品与成果" : "01 / Product & impact"}</p>
                  <h1>{selectedProject.title}</h1>
                  <strong>{language === "zh" ? "面向家庭日常辅食决策的已上线全栈产品" : "A live full-stack product for everyday feeding decisions"}</strong>
                  <p className="fushi-overview-intro">{language === "zh" ? "把分散在记忆、记录和库存中的信息，连接成家长每天真正会使用的产品流程。" : "It connects profile, history and inventory data in the workflows families use every day."}</p>
                  <div className="fushi-overview-questions">
                    <span>{language === "zh" ? "两个相互关联的家庭任务" : "Two connected family tasks"}</span>
                    <ul>{(language === "zh"
                      ? ["结合宝宝档案、历史和库存安排今天的饮食", "持续记录食物引入，并在出现反应时回溯上下文"]
                      : ["Plan today’s meals using the baby’s profile, history and available ingredients", "Track food introductions over time and review context when a reaction occurs"]
                    ).map((question, index) => <li key={question}><span>0{index + 1}</span><strong>{question}</strong></li>)}</ul>
                  </div>
                  <div className="fushi-overview-evidence">
                    <div><strong>300+</strong><span>{language === "zh" ? "截至 2026 年 8 月累计用户" : "cumulative users by Aug 2026"}</span></div>
                    <div><span>{language === "zh" ? "独立端到端负责" : "Sole end-to-end owner"}</span><p>{language === "zh" ? "负责产品与交互设计、小程序、Node.js 服务、Agent、测试、部署和用户问题排查。" : "Owned product and interaction design, the Mini Program, Node.js services, Agent workflow, testing, deployment and user-issue investigation."}</p></div>
                  </div>
                </div>
                <figure className="fushi-overview-visual">
                  <span>{language === "zh" ? "产品概览" : "Product overview"}</span>
                  <img src={language === "zh" ? galleryImages[0] : "/assets/fushi-overview-en.png"} alt={t.galleryAlt[0]} />
                </figure>
              </section>
            )}

            {fushiSection === "agent" && (
              <section className="fushi-case-content">
                <header className="fushi-case-heading">
                  <div><p>02 / Agent & MCP</p><h1>{language === "zh" ? "受控的 Agent 执行" : "Controlled Agent Execution"}</h1></div>
                  <p>{language === "zh" ? "模型提出动作；确定性的应用代码负责授权并执行。" : "The model requests an action. Deterministic application code authorizes and executes it."}</p>
                </header>
                <figure className="fushi-agent-control-plane" aria-label={language === "zh" ? "受控的生产 Agent 执行路径" : "Controlled production Agent execution path"}>
                  <div className="fushi-agent-step fushi-agent-step--request"><small>{language === "zh" ? "线上小程序 · 已登录用户" : "Live Mini Program · Authenticated user"}</small><strong>{language === "zh" ? "“用现有食材安排一餐，确认后保存”" : "“Plan a meal, then save it after I confirm”"}</strong></div>
                  <i className="fushi-agent-arrow fushi-agent-arrow--request" aria-hidden="true">→</i>
                  <div className="fushi-agent-step fushi-agent-step--model"><small>DeepSeek</small><strong>{language === "zh" ? "理解意图" : "Interpret intent"}</strong><p>{language === "zh" ? "提出类型化 Tool 请求" : "Propose a typed tool request"}</p></div>
                  <i className="fushi-agent-arrow fushi-agent-arrow--model" aria-hidden="true">→</i>
                  <div className="fushi-agent-step fushi-agent-step--primary">
                    <small>{language === "zh" ? "应用控制层" : "Application control"}</small>
                    <strong>{language === "zh" ? "校验并授权" : "Validate & authorize"}</strong>
                    <p>{language === "zh" ? "身份来自可信 Session；只有应用代码可以允许执行" : "Identity comes from the trusted session; only application code can allow execution"}</p>
                    <ul>
                      {(language === "zh"
                        ? ["Schema", "Session 身份", "授权", "食品安全", "变更预览与确认", "执行限制"]
                        : ["Schema", "Session identity", "Authorization", "Food safety", "Preview & confirmation", "Execution limits"]
                      ).map((control) => <li key={control}>{control}</li>)}
                    </ul>
                  </div>
                  <i className="fushi-agent-arrow fushi-agent-arrow--service" aria-hidden="true">→</i>
                  <div className="fushi-agent-step fushi-agent-step--service">
                    <small>{language === "zh" ? "确定性服务" : "Domain service"}</small>
                    <strong>{language === "zh" ? "执行业务能力" : "Execute capability"}</strong>
                    <ul>{["Profile", "Menu", "Inventory", "Reaction"].map((capability) => <li key={capability}>{capability}</li>)}</ul>
                    <p>{language === "zh" ? "结构化结果返回模型，生成有依据的响应" : "Return a structured result for a grounded response"}</p>
                  </div>
                  <figcaption>
                    <div><span>{language === "zh" ? "MCP 集成" : "MCP integration"}</span><strong>{language === "zh" ? "同一控制层，另一种入口" : "Same controls, another entry point"}</strong></div>
                    <p>{language === "zh" ? "Resources：只读上下文 · Tools：校验、授权并确认" : "Resources: read-only context · Tools: validated, authorized and confirmed"}</p>
                  </figcaption>
                </figure>
              </section>
            )}

            {fushiSection === "fullstack" && (
              <section className="fushi-case-content">
                <header className="fushi-case-heading">
                  <div><p>03 / {language === "zh" ? "生产反馈闭环" : "Production Feedback"}</p><h1>{language === "zh" ? "从用户反馈到可复现修复" : "From User Reports to Reproducible Fixes"}</h1></div>
                  <p>{language === "zh" ? "我使用内部 React 支持后台、有限 Trace 和分层测试，把线上问题转化为更安全的后续发布。" : "I use an internal React console, limited traces and layered tests to turn production issues into safer releases."}</p>
                </header>
                <div className="fushi-feedback-system">
                  <figure className="fushi-feedback-console">
                    <span>{language === "zh" ? "内部支持工具" : "Internal support tool"}</span>
                    <img src={galleryImages[3]} alt={t.galleryAlt[3]} />
                    <figcaption>{language === "zh" ? "由我本人用于调查真实用户反馈的 React 后台" : "React console I use to investigate real user reports"}</figcaption>
                  </figure>
                  <div className="fushi-feedback-evidence">
                    <article><strong>&gt;96%</strong><span>{language === "zh" ? "API 行覆盖率" : "API line coverage"}</span></article>
                    <article><strong>≈90%</strong><span>{language === "zh" ? "React 行覆盖率" : "React line coverage"}</span></article>
                    <article><strong>9</strong><span>{language === "zh" ? "初始 Agent 回归案例" : "Initial Agent regression cases"}</span></article>
                  </div>
                  <ol className="fushi-feedback-loop">
                    {(language === "zh"
                      ? [["用户反馈", "记录可观察到的问题"], ["安全调查", "通过后台和有限 Trace 定位失败步骤"], ["稳定复现", "使用系统测试或固定 Agent 案例捕获问题"], ["修复发布", "增加回归保护并交付更安全的版本"]]
                      : [["User report", "Capture the observable problem"], ["Safe investigation", "Use the console and limited traces to locate the failed step"], ["Reproduce", "Capture it with a system test or fixed Agent case"], ["Fix & release", "Add regression protection and ship a safer version"]]
                    ).map(([title, body], index) => <li key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{body}</p></li>)}
                  </ol>
                  <div className="fushi-feedback-boundary">
                    <span>{language === "zh" ? "受控诊断" : "Controlled diagnostics"}</span>
                    <strong>{language === "zh" ? "经用户授权的诊断范围 · 受保护记录保持只读 · 摘要式 Trace 尽量减少家庭数据留存" : "Consent-scoped diagnostics · protected records stay read-only · summary traces minimize retained family data"}</strong>
                  </div>
                </div>
              </section>
            )}

            {casePager}
          </div>
        </main>
        <PresentationDock />
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
          <div className="focus-line"><span>Java / Spring</span><span>React / TypeScript</span><span>REST / MongoDB</span><span>Kubernetes / Nginx</span><span>LLM Agents / MCP</span></div>
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
                <button className="project-card" disabled aria-label={`${t.openProject}: ${project.title}`}>
                  <div className="project-index">0{projectIndex + 1}</div>
                  <div className="project-card-body">
                    <p className="project-role">{project.role}</p>
                    <h3>{project.title}</h3>
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
