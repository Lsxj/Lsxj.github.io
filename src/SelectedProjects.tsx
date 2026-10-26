import type { Language } from "./content";
import "./selected-projects.css";

export function SelectedProjects({ language }: { language: Language }) {
  const zh = language === "zh";
  const items = zh ? [
    { name: "Citi Velocity", result: "≈60%", detail: "首屏等待与白屏时间降幅" },
    { name: "NutriFlow AI", result: "350+", detail: "累计用户 · 2026 年 10 月" },
  ] : [
    { name: "Citi Velocity", result: "≈60%", detail: "Less initial wait and blank-screen time" },
    { name: "NutriFlow AI", result: "350+", detail: "Cumulative users · Oct 2026" },
  ];
  return <main className="project-summary-main" id="main-content">
    <section className="project-summary-slide" aria-labelledby="project-summary-title">
      <header className="project-summary-heading">
        <h1 id="project-summary-title">{zh ? "项目与价值" : "Selected work & impact"}</h1>
      </header>
      <div className="project-summary-grid">
        <article className="project-summary-card project-summary-card--business">
          <h2>CitiDirect Entitlements</h2>
          <div className="project-summary-result">
            <strong>{zh ? <>让管理<br />更简单</> : <>Simpler<br />administration</>}</strong>
            <p>{zh ? "企业用户与权限管理" : "Corporate user and access management"}</p>
          </div>
        </article>
        {items.map((item) => <article className="project-summary-card" key={item.name}>
          <h2>{item.name}</h2>
          <div className="project-summary-result"><strong>{item.result}</strong><p>{item.detail}</p></div>
        </article>)}
      </div>
    </section>
  </main>;
}
