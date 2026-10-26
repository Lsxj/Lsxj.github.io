import { content, type Language } from './content';
import './velocity-presentation.css';

export const velocitySections = ['overview', 'architecture', 'performance', 'results'] as const;
export type VelocitySection = typeof velocitySections[number];

const copy = {
  en: {
    labels: ['Overview', 'Search architecture', 'Performance', 'Results'],
    pages: {
      overview: { title: 'Citi Velocity Content & Search', lead: 'Citi’s digital platform for institutional investors', rows: [
        ['Business context', 'Research, market data, multimedia and applications — with Search as the platform’s second-highest-traffic entry point.'],
        ['My ownership', 'Led 4 frontend engineers across Content, Notification & Search.\nOwned Search UI architecture and performance.'],
        ['Delivery scope', 'Typeahead → full results page.\nAPI and release coordination with 4 data teams.']], outcome: 'About 60% less initial wait and blank-screen time across the Search journey.' },
      architecture: { title: 'Configurable rendering and shared integration', lead: 'Different content types, reusable React components', rows: [
        ['Result rendering', 'React and TypeScript with the Strategy Pattern mapped different result types to reusable components. Metadata supported configuration-based extensions.'],
        ['Application integration', 'A shared FDC3 contract passed search parameters consistently to market-data portlets maintained by different teams.'],
        ['Design boundary', 'Rendering configuration and cross-application integration solved different concerns: how results appear, and how search context reaches other applications.']], outcome: 'One rendering approach for heterogeneous results, with a common integration contract.' },
      performance: { title: 'Reducing initial wait and blank screens', lead: 'Loading everything at once created a resource queue', rows: [
        ['Original bottleneck', 'Resources loaded together without a clear priority. Large numbers of requests queued while waiting to load.'],
        ['Webpack code splitting', 'Split application code so the initial journey did not need to load every feature together.'],
        ['Lazy loading', 'Load features when needed instead of including all work in the initial experience.'],
        ['Skeleton Screens', 'Show a loading structure while content is pending. This improves feedback while code and data continue loading.']], outcome: '≈60% reduction in initial wait and blank-screen time, measured by a dedicated Performance Test Team.' },
      results: { title: 'Results', lead: '', rows: [], outcome: '' },
    }
  },
  zh: {
    labels: ['项目概览', '搜索架构', '性能优化', '项目成果'],
    pages: {
      overview: { title: 'Citi Velocity Content & Search', lead: '花旗面向机构投资者的数字平台', rows: [
        ['业务背景', '汇集研报、市场数据、多媒体与应用，Search 是平台第二大流量入口。'],
        ['我的职责', '带领 4 名前端工程师，覆盖 Content、Notification 与 Search。\n负责 Search 界面架构与性能优化。'],
        ['交付范围', '搜索框联想 → 完整结果页。\n与 4 个数据团队协调 API 与发布。']], outcome: '整个 Search 体验的首屏等待与白屏时间改善约 60%。' },
      architecture: { title: '配置化渲染与统一集成', lead: '不同内容类型，复用 React 组件', rows: [
        ['结果渲染', '使用 React、TypeScript 和策略模式，将不同结果类型映射为可复用组件，通过元数据配置扩展。'],
        ['应用集成', '通过统一 FDC3 契约，将搜索参数传递给不同团队维护的市场数据 Portlet。'],
        ['设计边界', '渲染配置与跨应用集成解决不同问题：前者决定如何展示结果，后者负责搜索上下文如何传递。']], outcome: '异构结果共享渲染方式，跨团队应用共享集成契约。' },
      performance: { title: '减少首屏等待与白屏', lead: '资源集中加载且缺少先后顺序，造成大量请求排队', rows: [
        ['原始瓶颈', '所有资源集中加载，没有明确的加载优先顺序，大量资源排队等待加载。'],
        ['Webpack 拆包', '拆分应用代码，使首屏无需一起加载全部功能。'],
        ['懒加载', '在功能需要时加载，减少初始体验承担的加载工作。'],
        ['骨架屏', '内容加载期间先展示结构，提供等待反馈；代码与数据仍在继续加载。']], outcome: '专门的 Performance Test Team 负责测量，首屏等待与白屏时间改善约 60%。' },
      results: { title: 'Results', lead: '', rows: [], outcome: '' },
    }
  }
};

export function VelocityPresentation({ language, section }: {
  language: Language; section: VelocitySection;
}) {
  const t = copy[language], page = t.pages[section];
  if (section === 'overview') {
    const overview = t.pages.overview;
    return <section className="web-velocity-slide web-velocity-overview" aria-labelledby="velocity-title">
      <div className="web-velocity-overview-top">
        <header>
          <p>Citi Velocity / {t.labels[0]}</p>
          <h1 id="velocity-title">Citi Velocity<br />Content &amp; Search</h1>
          <div className="web-velocity-role">{content[language].projects.find(project => project.id === 'velocity')?.role}</div>
          <h2>{overview.lead}</h2>
          <div className="web-velocity-context">{overview.rows[0][1]}</div>
        </header>
        <aside className="web-velocity-scale" aria-label={language === 'en' ? 'Platform scale' : '平台规模'}>
          <h3>{language === 'en' ? 'Platform scale' : '平台规模'}</h3>
          <dl>
            <div><dt>≈100,000</dt><dd>{language === 'en' ? 'institutional investors' : '名机构投资者'}</dd></div>
            <div><dt>150</dt><dd>{language === 'en' ? 'countries' : '个国家'}</dd></div>
            <div><dt>200+</dt><dd>{language === 'en' ? 'business applications' : '个业务应用'}</dd></div>
          </dl>
        </aside>
      </div>
      <div className="web-velocity-overview-details">
        {overview.rows.slice(1).map(([title, body]) => <article key={title}><h3>{title}</h3>{body.split("\n").map(line => <p key={line}>{line}</p>)}</article>)}
      </div>
    </section>;
  }
  if (section === 'architecture') {
    const en = language === 'en';
    const lanes = en ? [
      { title: 'Filter, then load and render', why: 'The page has many portlets. The search-term category filters which remain.', steps: [], detail: 'Company, Commentator and other categories determine the filter. Order and layout configuration govern the remaining portlets.', outcome: 'Filter by category → load and render in configured order and layout.' },
      { title: 'Pass context between applications', why: 'Market-data portlets are maintained by different teams.', steps: ['Search parameters', 'Shared FDC3 contract', 'Market-data portlets'], detail: 'A common integration contract keeps search parameters consistent across applications.', outcome: 'A consistent way to pass search context across team boundaries.' },
    ] : [
      { title: '先过滤，再加载渲染', why: '页面有多个 Portlet，根据搜索词类别进行过滤。', steps: [], detail: 'Company、Commentator 等类别决定过滤结果；剩余 Portlet 按顺序与布局配置展示。', outcome: '按类别过滤 → 按配置的顺序与布局依次加载、渲染。' },
      { title: '在应用之间传递搜索上下文', why: '市场数据 Portlet 由不同团队维护。', steps: ['搜索参数', '统一 FDC3 契约', '市场数据 Portlet'], detail: '以共用集成契约，保持跨应用搜索参数的一致性。', outcome: '跨团队应用以一致的方式接收搜索上下文。' },
    ];
    return <section className="web-velocity-slide web-velocity-architecture" aria-labelledby="velocity-title">
      <header><p>Citi Velocity / {t.labels[1]}</p><h1 id="velocity-title">{en ? 'Configuring the Search page experience' : '配置驱动的搜索页面展示'}</h1><h2>{en ? 'Category filtering, configured rendering and shared application context.' : '按类别过滤、按配置渲染，并在应用间传递上下文。'}</h2></header>
      <div className="web-velocity-architecture-lanes">{lanes.map((lane, i) => <article key={lane.title}>
        <div className="web-velocity-lane-heading"><span>0{i + 1}</span><h3>{lane.title}</h3></div>
        <p className="web-velocity-lane-why">{lane.why}</p>
        <div className={`web-velocity-diagram web-velocity-diagram--${i === 0 ? 'render' : 'context'}`}>
          {i === 0 ? <>
            <div className="web-velocity-diagram-input">{en ? 'Page portlets' : '页面 Portlets'}</div>
            <div className="web-velocity-diagram-arrow" aria-hidden="true">↓</div>
            <div className="web-velocity-diagram-core"><strong>{en ? 'Category filter' : '类别过滤'}</strong><small>Company · Commentator · …</small></div>
            <div className="web-velocity-diagram-arrow" aria-hidden="true">↓</div>
            <div className="web-velocity-diagram-output"><strong>{en ? 'Load & render' : '加载与渲染'}</strong><small className="web-velocity-render-config">{en ? 'Remaining portlets · configured order & layout' : '剩余 Portlet · 按顺序与布局配置依次执行'}</small></div>
          </> : <>
            <div className="web-velocity-diagram-input">{lane.steps[0]}</div>
            <div className="web-velocity-diagram-arrow" aria-hidden="true">↓</div>
            <div className="web-velocity-diagram-core"><strong>{lane.steps[1]}</strong><small>{en ? 'Consistent search context' : '一致的搜索上下文'}</small></div>
            <div className="web-velocity-connector" aria-hidden="true"><svg viewBox="0 0 400 36" preserveAspectRatio="none"><path d="M200 0 V16 M66 34 V16 H334 V34 M200 16 V34" /></svg></div>
            <div className="web-velocity-diagram-portlets">{[1, 2, 3].map(n => <span key={n}><i aria-hidden="true" />Portlet</span>)}</div>
          </>}
        </div>
      </article>)}</div>
    </section>;
  }
  if (section === 'performance') {
    const en = language === 'en';
    return <section className="web-velocity-slide web-velocity-performance web-velocity-performance-strategy" aria-labelledby="velocity-title">
      <header><p>Citi Velocity / {t.labels[2]}</p><h1 id="velocity-title">{en ? 'Less to load. Less blank-screen waiting.' : '减少加载负担，改善白屏等待。'}</h1><h2>{en ? 'Resources loaded together without priority, leaving requests queued.' : '资源同时加载、缺少优先顺序，大量请求排队等待。'}</h2></header>
      <div className="velocity-strategy-columns">
        <article className="velocity-strategy-loading">
          <h2><span>01</span>{en ? 'Reduce initial loading' : '减少首屏加载负担'}</h2>
          <div className="velocity-strategy-step"><h3>Webpack code splitting</h3><p>{en ? 'Make features independently loadable.' : '让不同功能可以独立加载。'}</p>
            <div className="velocity-split-diagram"><div>{en ? 'Search module code' : 'Search 模块代码'}</div><span aria-hidden="true">→</span><div className="velocity-code-chunks"><b>{en ? 'Initial chunks' : '首屏必需代码块'}</b><b>{en ? 'Other feature chunks' : '其他功能代码块'}</b></div></div>
          </div>
          <div className="velocity-strategy-step"><h3>Lazy loading</h3><p>{en ? 'Defer both code loading and data fetching until needed.' : '代码加载与数据请求都按需触发。'}</p>
            <div className="velocity-timing-diagram"><div><small>{en ? 'INITIAL LOAD' : '首屏加载'}</small><strong>{en ? 'Essential code & data' : '首屏所需代码与数据'}</strong></div><span aria-hidden="true">→</span><div><small>{en ? 'WHEN NEEDED' : '需要时'}</small><strong>{en ? 'Additional code & data' : '其他代码与数据'}</strong></div></div>
          </div>
        </article>
        <article className="velocity-strategy-feedback">
          <h2><span>02</span>{en ? 'Improve waiting feedback' : '改善等待反馈'}</h2>
          <div className="velocity-strategy-step"><h3>Skeleton Screens</h3><p>{en ? 'Show page structure while content loads.' : '内容加载时，先展示页面骨架。'}</p>
            <div className="velocity-skeleton-demo" aria-label={en ? 'Schematic: blank screen becomes a skeleton layout' : '示意：空白页面变为骨架布局'}>
              <div><small>{en ? 'BLANK' : '空白'}</small><div className="velocity-mini-window" /></div>
              <span aria-hidden="true">→</span>
              <div><small>{en ? 'VISIBLE STRUCTURE' : '可见的页面结构'}</small><div className="velocity-mini-window velocity-mini-skeleton" aria-hidden="true"><i /><i /><div><b /><b /></div><i /><i /></div></div>
            </div>
            <p className="velocity-feedback-note">{en ? 'Immediate visual feedback while waiting for content.' : '等待内容时，持续提供可见反馈。'}</p>
          </div>
        </article>
      </div>
    </section>;
  }
  if (section === 'results') {
    const en = language === 'en';
    return <section className="web-velocity-slide web-velocity-results" aria-labelledby="velocity-title">
      <header><p>Citi Velocity / {t.labels[3]}</p><h1 id="velocity-title">{en ? 'Performance impact & recognition' : '性能成果与工作认可'}</h1></header>
      <div className="web-velocity-results-hero">
        <strong>≈60%</strong>
        <div><h2>{en ? 'Less initial wait and blank-screen time' : '首屏等待与白屏时间减少'}</h2><p>{en ? 'Measured by a dedicated Performance Test Team.' : '由专门的 Performance Test Team 测量。'}</p></div>
      </div>
      <div className="web-velocity-results-recognition"><h2>Citi Gratitude Awards</h2>
        <div className="web-velocity-results-award"><span>2019</span><h3>Golden Award</h3></div>
        <div className="web-velocity-results-award"><span>2021</span><h3>Silver Award</h3></div>
      </div>
    </section>;
  }
  return <section className="web-velocity-slide" aria-labelledby="velocity-title">
    <header><p>Citi Velocity / {t.labels[velocitySections.indexOf(section)]}</p><h1 id="velocity-title">{page.title}</h1><h2>{page.lead}</h2></header>
    <div className="web-velocity-rows">{page.rows.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
    <p className="web-velocity-outcome">{page.outcome}</p>

  </section>;
}
