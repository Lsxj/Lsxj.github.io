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
  const t = content[language];
  const projects = [...t.projects].sort((a, b) => projectIds.indexOf(a.id) - projectIds.indexOf(b.id));
  const selectedProject = activeProject === null ? null : projects[activeProject];
  const presentationMode = isPresentationUrl();

  useEffect(() => {
    if (PROJECT_DETAILS_ENABLED || presentationMode || !new URLSearchParams(window.location.search).has("project")) return;
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
  }, [activeProject, fushiSection, nextgenSection, presentationMode]);

  function showProject(index: number, replace = false) {
    if (!PROJECT_DETAILS_ENABLED && !presentationMode) return;
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
    window.history.replaceState(null, "", presentationMode ? `${window.location.pathname}?view=present` : window.location.pathname);
    setActiveProject(null);
    setFushiSection("overview");
    setNextgenSection("overview");
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

  function showPresentationPage(project: "intro" | "nextgen" | "fushi", section?: NextgenSection | FushiSection) {
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
    const sequence: Array<{ project: "intro" | "nextgen" | "fushi"; section?: NextgenSection | FushiSection }> = [
      { project: "intro" },
      ...nextgenSections.map((section) => ({ project: "nextgen" as const, section })),
      ...fushiSections.map((section) => ({ project: "fushi" as const, section })),
    ];
    const currentIndex = activeProject === null
      ? 0
      : selectedProject?.id === "nextgen"
        ? 1 + nextgenSections.indexOf(nextgenSection)
        : selectedProject?.id === "fushi"
          ? 1 + nextgenSections.length + fushiSections.indexOf(fushiSection)
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
    const fushiLabels = language === "zh"
      ? ["产品与成果", "Agent 与 MCP", "生产反馈"]
      : ["Product", "Agent & MCP", "Feedback"];

    return (
      <div className="presentation-dock-zone">
        <nav className="presentation-dock" aria-label={language === "zh" ? "演示页面快速导航" : "Presentation page shortcuts"}>
          <span className="presentation-dock-handle" aria-hidden="true" />
          <button
            className={activeProject === null ? "active" : ""}
            aria-current={activeProject === null ? "page" : undefined}
            onClick={() => showPresentationPage("intro")}
          >
            <span>01</span><strong>{language === "zh" ? "自我介绍" : "Introduction"}</strong>
          </button>
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
          <div className="presentation-dock-group presentation-dock-group--fushi">
            <span>{language === "zh" ? "辅食搭子" : "Baby Food Buddy"}</span>
            <div>
              {fushiSections.map((section, index) => (
                <button
                  key={section}
                  className={selectedProject?.id === "fushi" && fushiSection === section ? "active" : ""}
                  aria-current={selectedProject?.id === "fushi" && fushiSection === section ? "page" : undefined}
                  aria-label={`${language === "zh" ? "辅食搭子" : "Baby Food Buddy"} ${String(index + 1).padStart(2, "0")}: ${fushiLabels[index]}`}
                  title={fushiLabels[index]}
                  onClick={() => showPresentationPage("fushi", section)}
                >{String(index + 1).padStart(2, "0")}</button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    );
  }

  if (presentationMode && activeProject === null) {
    return (
      <div className="presentation-shell">
        <header className="presentation-header">
          <div>
            <span>{language === "zh" ? "01 / 自我介绍" : "01 / Introduction"}</span>
          </div>
          <div className="presentation-controls">
            <LanguageSwitch />
          </div>
        </header>

        <main className="presentation-main">
          <section className="presentation-intro" aria-labelledby="presentation-title">
            <div className="presentation-title-block">
              <div className="presentation-identity">
                <h1>{t.name}</h1>
                <div>
                  <strong>{language === "zh" ? "高级全栈工程师 · 九年花旗经历" : "Senior Full-Stack Engineer · Nine years at Citi"}</strong>
                  <span>{language === "zh" ? "厦门大学 · 软件工程与经济学双学位" : "Xiamen University · Software Engineering & Economics, Dual Degree"}</span>
                </div>
              </div>
              <div className="presentation-thesis">
                <h2 id="presentation-title">{language === "zh" ? "我关注完整的产品。" : "I care about the whole product."}</h2>
                <p>{language === "zh" ? "从理解用户需求到构建可靠的生产系统，我始终亲自参与设计与实现。" : "I stay hands-on—from understanding user needs to building reliable production systems."}</p>
              </div>
            </div>

            <div className="presentation-journey">
              <header>
                <span>{language === "zh" ? "我的一线实践路径" : "My hands-on journey"}</span>
              </header>
              <ol>
                <li className="presentation-stage presentation-stage--foundation">
                  <div className="presentation-stage-meta"><span>01</span><time>2017—2022</time></div>
                  <h2>{language === "zh" ? "界面" : "Interface"}</h2>
                  <h3>Citi Velocity</h3>
                </li>
                <li className="presentation-stage presentation-stage--foundation">
                  <div className="presentation-stage-meta"><span>02</span><time>2018—2019</time></div>
                  <h2>{language === "zh" ? "组件" : "Components"}</h2>
                  <h3>{language === "zh" ? "企业 React 组件库" : "Enterprise React Library"}</h3>
                </li>
                <li className="presentation-stage presentation-stage--focus presentation-stage--primary">
                  <div className="presentation-stage-meta"><span>03</span><time>2023—Now</time></div>
                  <h2>{language === "zh" ? "全栈" : "Full Stack"}</h2>
                  <h3>CitiDirect Nextgen Entitlements</h3>
                </li>
                <li className="presentation-stage presentation-stage--focus">
                  <div className="presentation-stage-meta"><span>04</span><time>2026—Now</time></div>
                  <h2>{language === "zh" ? "产品" : "Product"}</h2>
                  <h3>{language === "zh" ? "辅食搭子 · AI 产品" : "Baby Food Buddy · AI product"}</h3>
                </li>
              </ol>
            </div>

            <footer className="presentation-intro-footer">
              <button onClick={() => showProject(0)} aria-label={language === "zh" ? "进入 CitiDirect 项目展示" : "Open CitiDirect presentation"}><small>02 /</small>CitiDirect<span aria-hidden="true">→</span></button>
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
            : <span />}
          {currentCaseIndex < nextgenSections.length - 1
            ? <button className="next" onClick={() => showNextgenSection(nextgenSections[currentCaseIndex + 1])}><small>{language === "zh" ? "下一页" : "Next"}</small><strong>{nextgenCaseLabels[currentCaseIndex + 1]}</strong><span aria-hidden="true">→</span></button>
            : <button className="next" onClick={() => showProject(nextIndex, true)}><small>{language === "zh" ? "下一个项目" : "Next project"}</small><strong>{projects[nextIndex].title}</strong><span aria-hidden="true">→</span></button>}
        </nav>
      );

      return (
        <div className={`nextgen-deck${presentationMode ? " nextgen-deck--presentation" : ""}`} key={selectedProject.id}>
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
            <div className={`nextgen-page nextgen-page--solution nextgen-case-page nextgen-case-page--${nextgenSection}`}>
              {caseNavigation}

              {nextgenSection === "overview" && (
                <section className="nextgen-overview nextgen-overview--story nextgen-why-only">
                  <div className="nextgen-why-hero">
                    <div className="nextgen-overview-title">
                      <p>{language === "zh" ? "01 / 项目概览" : "01 / Project overview"}</p>
                      <h1>{language === "zh"
                        ? "CitiDirect Nextgen Entitlements"
                        : <>CitiDirect Nextgen <span className="nextgen-title-nowrap">Entitlements</span></>}</h1>
                      <span>{selectedProject.role}</span>
                      <p className="nextgen-product-intro">{language === "zh"
                        ? "CitiDirect Nextgen 是花旗企业数字银行平台 CitiDirect 的全新一代，围绕用户工作旅程重塑体验，并采用模块化、API 驱动的架构。"
                        : "CitiDirect Nextgen is the new generation of Citi’s corporate digital banking platform, redesigned around user journeys and a modular, API-driven architecture."}</p>
                      <p className="nextgen-product-intro">{language === "zh"
                        ? "Entitlements 是其中管理企业客户及其用户访问权限的模块。新版重建客户接入与持续管理、用户生命周期及权限分配能力，同时保留审批和安全控制。"
                        : "Entitlements manages access for corporate clients and their users. Within Nextgen, it rebuilds client onboarding and ongoing management, user lifecycle and access assignment while preserving approval and security controls."}</p>
                    </div>
                    <aside className="nextgen-why-scale" aria-label={language === "zh" ? "业务规模" : "Business scale"}>
                      <span>{language === "zh" ? "平台背景 · 非功能采用量" : "Platform context · not feature adoption"}</span>
                      <div><strong>90K+</strong><small>{language === "zh" ? "家机构" : "organizations"}</small></div>
                      <div><strong>90+</strong><small>{language === "zh" ? "个市场" : "markets"}</small></div>
                    </aside>
                  </div>

                  <div className="nextgen-transition-map nextgen-overview-transition-map">
                    <div className="nextgen-transition-columns" aria-hidden="true">
                      <span />
                      <span>{language === "zh" ? "旧版 Entitlements" : "Legacy Entitlements"}</span>
                      <span />
                      <span>Nextgen Entitlements</span>
                    </div>
                    <article>
                      <span className="nextgen-transition-number">01</span>
                      <div className="nextgen-transition-problem">
                        <strong>{language === "zh" ? "复杂的权限配置" : "Complex entitlement setup"}</strong>
                      </div>
                      <span className="nextgen-transition-arrow" aria-hidden="true">→</span>
                      <div className="nextgen-transition-solution">
                        <h2>{language === "zh" ? "可复用权限 Persona" : "Reusable entitlement personas"}</h2>
                      </div>
                    </article>
                    <article>
                      <span className="nextgen-transition-number">02</span>
                      <div className="nextgen-transition-problem">
                        <strong>{language === "zh" ? "Legal Entity 人工开户" : "Manual Legal Entity onboarding"}</strong>
                      </div>
                      <span className="nextgen-transition-arrow" aria-hidden="true">→</span>
                      <div className="nextgen-transition-solution">
                        <h2>{language === "zh" ? "事件驱动开户" : "Event-driven onboarding"}</h2>
                      </div>
                    </article>
                  </div>
                </section>
              )}

              {nextgenSection === "scope" && (
                <section className="nextgen-overview nextgen-overview--story nextgen-scope-page nextgen-ownership-page">
                  <header className="nextgen-ownership-heading">
                    <div><p>{language === "zh" ? "02 / 我的角色" : "02 / My role"}</p><h1>{language === "zh" ? "我的角色：技术负责人，也是核心开发者" : "My role: Tech Lead & hands-on engineer"}</h1></div>
                  </header>

                  <div className="nextgen-team-scope">
                    <p>{language === "zh" ? "六个团队共同建设 Entitlements；我带领的团队负责用户生命周期与权限管理旅程的交付。" : "Six teams built Entitlements. I led the team delivering the user lifecycle and access-management journey."}</p>
                    <ul>{(language === "zh"
                      ? ["用户创建、修改与删除", "Persona 权限分配与变更", "Checker 审批与拒绝"]
                      : ["User creation, updates & deletion", "Persona-based access assignment", "Checker approval & rejection"]
                    ).map((item) => <li key={item}>{item}</li>)}</ul>
                    <small>{language === "zh" ? "自动接入入口：初始用户创建，采用独立控制流程。" : "Automated onboarding: initial user creation through a separate control path."}</small>
                  </div>

                  <div className="nextgen-capability-grid nextgen-ownership-actions nextgen-role-contributions">
                    <article className="featured">
                      <h2>{language === "zh" ? "我的直接实现" : "Hands-on implementation"}</h2>
                      <p><strong>{language === "zh" ? "核心 User Service + React 权限流程" : "Core User Service + React permission workflow"}</strong><br />{language === "zh" ? "参与 Persona、Criteria、CDC、审计与 Provisioning 服务实现。" : "Contributed to Persona, Criteria, CDC, Audit and provisioning services."}</p>
                    </article>
                    <article>
                      <h2>{language === "zh" ? "共同设计与技术交付" : "Shared design & technical delivery"}</h2>
                      <p>{language === "zh" ? "与其他五个团队共同设计领域模型与 API 契约。带领 10+ 人中印团队完成集成、发布与生产支持。" : "Co-designed domain models and API contracts with the other five teams. Led 10+ engineers across China and India through integration, release and production support."}</p>
                    </article>
                  </div>
                </section>
              )}

              {nextgenSection === "backend" && (
                <section className="nextgen-case-content">
                  <header className="nextgen-ownership-heading nextgen-backend-heading">
                    <div>
                      <p>{language === "zh" ? "03 / 后端与数据" : "03 / Backend & data"}</p>
                      <h1>{language === "zh" ? "跨系统的用户与权限管理" : <>Managing users and access{" "}<br />across systems</>}</h1>
                      <p className="nextgen-backend-lead">{language === "zh"
                        ? "经过简化的非保密架构视图：我参与设计服务边界并实现核心用户流程，涵盖审批控制、企业客户范围隔离与下游同步。"
                        : "Simplified, non-confidential view: I co-designed the service boundaries and implemented core user workflows, with approval controls, client-scoped access and downstream synchronization."}</p>
                    </div>
                    <aside className="nextgen-backend-context">
                      <span>{language === "zh" ? "平台背景" : "Platform context"}</span>
                      <strong>{language === "zh" ? "多团队 Spring 平台" : "Multi-team Spring platform"}</strong>
                      <small>Java / Spring WebFlux / WebClient / MongoDB</small>
                    </aside>
                  </header>
                  <div className="nextgen-shared-auth">
                    <strong>{language === "zh" ? "共享 Spring Security 库" : "Shared Spring Security library"}</strong>
                    <p>{language === "zh" ? "统一校验 JWT 并提取登录用户信息；各业务服务执行自身的权限与客户范围规则。" : "Validates JWTs and exposes authenticated-user context; each business service enforces its own authorization and client-scope rules."}</p>
                  </div>
                  <figure className="nextgen-architecture-image" aria-label={language === "zh" ? "经过简化的客户接入与权限服务架构" : "Simplified client onboarding and access service architecture"}>
                    <img
                      src={language === "zh" ? "/assets/nextgen-architecture-zh.svg?v=10" : "/assets/nextgen-architecture-en.svg?v=10"}
                      alt={language === "zh" ? "经过简化的客户接入、审批、审计与下游同步架构" : "Simplified client onboarding, approval, audit and downstream synchronization architecture"}
                    />
                    <figcaption className="sr-only">
                      <span>Core User Service</span><span>Persona Service</span><span>UI layout metadata</span><span>Criteria Service</span><span>CDC Listener</span><span>Audit Service</span>
                    </figcaption>
                  </figure>
                </section>
              )}

              {nextgenSection === "frontend" && (
                <section className="nextgen-case-content">
                  <header className="nextgen-ownership-heading nextgen-backend-heading nextgen-frontend-heading">
                    <div><p>{language === "zh" ? "04 / 前端平台" : "04 / Frontend platform"}</p><h1>{language === "zh" ? "模块化前端中的 Schema 驱动 UI" : "Schema-driven UI on a modular frontend"}</h1></div>
                    <aside className="nextgen-frontend-context">
                      <strong>5</strong>
                      <span>{language === "zh" ? "个 React 应用" : "React applications"}</span>
                      <small>{language === "zh" ? "1 个 Host + 4 个 Remotes" : "1 host + 4 remotes"}</small>
                    </aside>
                  </header>
                  <figure className="nextgen-frontend-architecture-image" aria-label={language === "zh" ? "动态 Persona UI 与 Module Federation 架构" : "Dynamic persona UI and Module Federation architecture"}>
                    <img
                      src={language === "zh" ? "/assets/nextgen-frontend-architecture-zh.svg" : "/assets/nextgen-frontend-architecture-en.svg"}
                      alt={language === "zh" ? "Schema Lens 动态渲染与一个 React Host、四个 Remote 应用的 Module Federation 架构" : "Schema Lens dynamic rendering and a Module Federation architecture with one React host and four remote applications"}
                    />
                    <figcaption className="sr-only">
                      <span>Schema Lens</span><span>Persona Service</span><span>Criteria Service</span><span>React Host</span><span>Webpack Module Federation</span><span>Nginx</span>
                    </figcaption>
                  </figure>
                </section>
              )}

              {nextgenSection === "production" && (
                <section className="nextgen-case-content nextgen-production-page">
                  <header className="nextgen-ownership-heading nextgen-backend-heading">
                    <div>
                      <p>{language === "zh" ? "05 / 安全与生产工程" : "05 / Security & production"}</p>
                      <h1>{language === "zh" ? "安全与生产工程" : "Security and production engineering"}</h1>
                    </div>
                  </header>
                  <div className="nextgen-production-flow">
                    <article>
                      <span>{language === "zh" ? "01 / 门禁" : "01 / Gate"}</span>
                      <h2>{language === "zh" ? "安全与工作流测试进入发布路径" : "Security and workflow tests in the release path"}</h2>
                      <p>{language === "zh" ? "SonarQube、Snyk、SAST 与 BDD / Cucumber 集成到 GitLab CI 和 Harness。" : "SonarQube, Snyk, SAST and BDD / Cucumber integrated with GitLab CI and Harness."}</p>
                      <div><strong>90%+</strong><small>{language === "zh" ? "自动化测试覆盖率" : "automated test coverage"}</small></div>
                    </article>
                    <article>
                      <span>{language === "zh" ? "02 / 发布" : "02 / Release"}</span>
                      <h2>{language === "zh" ? "Kubernetes / OpenShift 发布保护" : "Kubernetes and OpenShift release safeguards"}</h2>
                      <p>{language === "zh" ? "Readiness / Liveness Probe、部署验证和回滚准备支撑生产发布。" : "Readiness and liveness probes, deployment verification and rollback preparation supported production releases."}</p>
                      <div><strong>{language === "zh" ? "健康检查" : "Health"}</strong><small>{language === "zh" ? "就绪、存活与发布验证" : "readiness, liveness and verification"}</small></div>
                    </article>
                    <article>
                      <span>{language === "zh" ? "03 / 诊断" : "03 / Diagnose"}</span>
                      <h2>{language === "zh" ? "请求级跨服务故障定位" : "Request-level diagnosis across services"}</h2>
                      <p>{language === "zh" ? "结构化日志、Request ID 与 Actuator 健康信号支持在 Kibana 中区分代码、配置、授权和下游故障。" : "Structured logs, request IDs and Actuator health signals helped distinguish application, configuration, authorization and downstream failures in Kibana."}</p>
                      <div><strong>{language === "zh" ? "可追踪" : "Traceable"}</strong><small>{language === "zh" ? "跨服务请求与故障边界" : "cross-service requests and failure boundaries"}</small></div>
                    </article>
                  </div>
                  <div className="nextgen-production-scale">
                    <div>
                      <span>{language === "zh" ? "遗留模型迁移" : "Legacy transition"}</span>
                      <strong>{language === "zh" ? "分阶段" : "Phased"}</strong>
                      <small>{language === "zh" ? "新旧权限模型并行" : "legacy and new models coexist"}</small>
                    </div>
                    <p>{language === "zh" ? "共同设计转换规则与分批验证方案，避免把数据和运营风险集中到一次全球切换。" : "Co-designed transformation rules and staged validation so data and operational risk were not concentrated in one global cutover."}</p>
                  </div>
                </section>
              )}

              {nextgenSection === "result" && (
                <section className="nextgen-case-content nextgen-result-page">
                  <header className="nextgen-ownership-heading nextgen-backend-heading">
                    <div>
                      <p>{language === "zh" ? "06 / 项目成果" : "06 / Result"}</p>
                      <h1>{language === "zh" ? "生产中真正发生的改变" : "What changed in production"}</h1>
                    </div>
                    <aside className="nextgen-result-live">
                      <strong>{language === "zh" ? "已上线" : "Live"}</strong>
                      <span>{language === "zh" ? "从请求、审批到下游同步" : "request, approval and downstream sync"}</span>
                    </aside>
                  </header>

                  <div className="nextgen-result-outcomes">
                    <article>
                      <strong>{language === "zh" ? "端到端" : "End-to-end"}</strong>
                      <span>{language === "zh" ? "管理生命周期" : "Administration lifecycle"}</span>
                      <h2>{language === "zh" ? "从用户请求到权限同步" : "From user request to entitlement sync"}</h2>
                      <p>{language === "zh" ? "覆盖用户创建、修改与删除请求，Checker 审批与拒绝，以及同步的权限变更。" : "Covered user create, modify and delete requests, checker approvals and rejections, and synchronized entitlement changes."}</p>
                    </article>
                    <article>
                      <strong>{language === "zh" ? "事件驱动" : "Event-driven"}</strong>
                      <span>{language === "zh" ? "客户接入" : "Client onboarding"}</span>
                      <h2>{language === "zh" ? "CRM 事件自动触发开户" : "CRM events automated onboarding"}</h2>
                      <p>{language === "zh" ? "触发 Legal Entity、用户与权限开通，替代原有部分人工设置流程。" : "Triggered Legal Entity, user and entitlement provisioning, replacing part of the manual setup flow."}</p>
                    </article>
                  </div>

                  <div className="nextgen-result-close">
                    <div><span>{language === "zh" ? "Citi 荣誉" : "Citi recognition"}</span><strong>Citi Gratitude <em>Golden</em> Award</strong><small>2024</small></div>
                    <p>{language === "zh" ? "这个项目体现了我从平台设计、核心实现和跨团队交付一直参与到生产支持。" : "This project demonstrates ownership from platform design and core implementation through cross-team delivery and production support."}</p>
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
      <nav className="fushi-case-nav" aria-label={language === "zh" ? "辅食搭子案例分页" : "Baby Food Buddy case study pages"}>
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
                    <div><span>{language === "zh" ? "已验证的次级入口 · MCP" : "Validated secondary entry · MCP"}</span><strong>{language === "zh" ? "复用同一应用控制层" : "Reuse the same application control"}</strong></div>
                    <p>{language === "zh" ? "只读 Resources 提供上下文；状态变更 Tools 仍需校验、授权与确认。23 个 Tools、10 个 Resources 和 3 个 Prompts 仅说明实现范围。" : "Read-only Resources provide context; state-changing Tools still require validation, authorization and confirmation. The 23 Tools, 10 Resources and 3 Prompts describe implementation scope only."}</p>
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
                    <article><strong>9</strong><span>{language === "zh" ? "Agent 回归种子案例 · 非准确率" : "Agent regression seed cases · not accuracy"}</span></article>
                  </div>
                  <ol className="fushi-feedback-loop">
                    {(language === "zh"
                      ? [["用户反馈", "记录可观察到的问题"], ["安全调查", "通过后台和有限 Trace 定位失败步骤"], ["稳定复现", "使用系统测试或固定 Agent 案例捕获问题"], ["修复发布", "增加回归保护并交付更安全的版本"]]
                      : [["User report", "Capture the observable problem"], ["Safe investigation", "Use the console and limited traces to locate the failed step"], ["Reproduce", "Capture it with a system test or fixed Agent case"], ["Fix & release", "Add regression protection and ship a safer version"]]
                    ).map(([title, body], index) => <li key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{body}</p></li>)}
                  </ol>
                  <div className="fushi-feedback-boundary">
                    <span>{language === "zh" ? "最小权限调查" : "Least-privilege investigation"}</span>
                    <strong>{language === "zh" ? "仅查看授权范围内的诊断信息 · 家庭过敏记录只读 · Trace 不保留完整 Prompt · 当前尚无统计意义充分的线上 Agent 质量指标" : "Consent-scoped diagnostics · allergy records remain read-only · traces omit complete prompts · no statistically meaningful online Agent-quality claim yet"}</strong>
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
