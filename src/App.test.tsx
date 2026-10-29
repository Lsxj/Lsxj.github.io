import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("portfolio", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("leads with Citi experience while retaining the verified AI project", () => {
    render(<App />);
    const projectButtons = screen.getAllByRole("button", { name: /Project details unavailable|项目详情暂未开放/ });
    expect(projectButtons[0]).toHaveAccessibleName(/CitiDirect Nextgen Entitlements/);
    projectButtons.forEach((button) => expect(button).toBeDisabled());
    expect(screen.getByRole("heading", { name: /NutriFlow AI/ })).toBeInTheDocument();
    expect(screen.getByText(/live full-stack product|已上线的辅食规划与健康记录全栈产品/)).toBeInTheDocument();
    expect(screen.getByText(/300\+ users|300\+ 用户/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:lsxj615@foxmail.com");
    expect(document.body).not.toHaveTextContent("15759266706");
  });

  it("switches language and remembers the selection", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "中" }));
    expect(screen.getByText(/可靠的生产平台、全栈应用/)).toBeInTheDocument();
    expect(screen.getByText(/软件工程和经济学双学位/)).toBeInTheDocument();
    expect(screen.getByText(/直接管理 6 名工程师/)).toBeInTheDocument();
    expect(screen.getByText("2017—2026.10.17")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "花旗 · AVP / 高级软件工程师" })).toBeInTheDocument();
    expect(screen.getByText(/150 个国家近 10 万名机构投资者/)).toBeInTheDocument();
    expect(screen.getByText(/2018\.07—2019\.01/)).toBeInTheDocument();
    expect(window.localStorage.getItem("portfolio-language")).toBe("zh");
  });

  it("keeps project details available only in presentation mode", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: /Building enterprise applications|构建贯穿界面/ })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Selected work" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exit" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Presentation page shortcuts" })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Open Why this role" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CitiDirect 01: Overview" }));
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Back to introduction/ })).not.toBeInTheDocument();
    expect(window.location.search).toContain("view=present");
    expect(window.location.search).toContain("project=nextgen");
  });

  it("jumps directly between presentation pages from the hidden dock", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);

    expect(screen.queryByRole("button", { name: /NutriFlow AI/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CitiDirect 04: Frontend" }));
    expect(screen.getByRole("heading", { level: 1, name: "Schema-driven UI and modular delivery" })).toBeInTheDocument();
    expect(screen.getByText(/Persona metadata and layout drive the UI through a shared rendering engine|Persona 元数据与布局配置驱动界面/)).toBeInTheDocument();
    expect(window.location.search).toContain("project=nextgen");
    expect(window.location.search).toContain("section=frontend");
  });

  it("moves through projects and Why before CitiDirect in the default Apple presentation", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1, name: "Selected work & impact" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Why this role in Enterprise Systems" })).toBeInTheDocument();
    expect(window.location.search).toBe("?view=present&section=why-role");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "Why this role in Enterprise Systems" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { level: 1, name: "Selected work & impact" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { level: 2, name: "Building enterprise applications across UI, services and data." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CitiDirect 06: Result" }));
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 2, name: "Building enterprise applications across UI, services and data." })).toBeInTheDocument();
  });

  it("opens direct project routes in presentation mode", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=backend");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /User and access management across systems|跨系统的用户与权限管理/ })).toBeInTheDocument();
    const diagram = screen.getByRole("img", { name: /CRM events and user actions reach the Core User Service/ });
    expect(diagram).toHaveAttribute("src", expect.stringContaining("/assets/nextgen-architecture-en.svg"));
    expect(screen.getByRole("navigation", { name: /CitiDirect case study pages|CitiDirect 案例分页/ })).toBeInTheDocument();
  });

  it("combines project context and workflow changes on the overview page", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=overview");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Reusable permission sets \(personas\)|可复用的权限组合（Persona）/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Event-driven onboarding|事件驱动的接入流程/ })).toBeInTheDocument();
    expect(screen.getByText(/Case page 01 \/ 06|案例页 01 \/ 06/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approach|整体方案/ })).not.toBeInTheDocument();
  });

  it("distinguishes hands-on contributions from technical leadership", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=scope");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /Tech Lead & hands-on engineer|技术负责人，也是核心开发者/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hands-on engineering" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Technical leadership" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Core User Service" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Permission management workflow" })).toBeInTheDocument();
    expect(screen.getByText("Led 10+ engineers across China and India, working with five other teams.")).toBeInTheDocument();
    expect(screen.getByText("Co-designed domain models and API contracts.")).toBeInTheDocument();
  });

  it("excludes other project routes from this presentation", () => {
    window.history.replaceState(null, "", "/?view=present&project=fushi&section=agent");
    render(<App />);
    expect(window.location.search).toBe("?view=present");
    expect(screen.getByRole("heading", { level: 2, name: "Building enterprise applications across UI, services and data." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Controlled Agent Execution" })).not.toBeInTheDocument();
  });

  it("redirects old project-detail URLs to the portfolio homepage", () => {
    window.history.replaceState(null, "", "/?project=fushi&section=agent");
    render(<App />);
    expect(window.location.search).toBe("");
    expect(screen.getByRole("heading", { name: /Selected projects|精选项目/ })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /case study pages|案例分页/ })).not.toBeInTheDocument();
  });
});

it("normalizes legacy AiDP links and retains the selected page", () => {
  window.localStorage.setItem("portfolio-language", "en");
  window.history.replaceState(null, "", "/?view=present&role=aidp&section=projects");
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Selected work & impact" })).toBeInTheDocument();
  expect(window.location.search).toBe("?view=present&section=projects");
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getByText("Cumulative users · Oct 2026")).toBeInTheDocument();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByRole("heading", { name: "Why this role in Enterprise Systems" })).toBeInTheDocument();
  expect(window.location.search).toBe("?view=present&section=why-role");
  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(screen.getByRole("heading", { level: 1, name: "Selected work & impact" })).toBeInTheDocument();
});

describe("Web role presentation", () => {
  beforeEach(() => {
    window.localStorage.setItem("portfolio-language", "en");
    window.history.replaceState(null, "", "/?view=present&company=standard-chartered");
  });

  it("keeps role context through the complete frontend presentation sequence", () => {
    render(<App />);
    expect(screen.getByText("Citi Velocity")).toHaveClass("intro-work-featured");
    expect(screen.getByText("CitiDirect Entitlements")).not.toHaveClass("intro-work-featured");
    fireEvent.click(screen.getByRole("button", { name: "Open Why this role" }));
    expect(screen.getByText("Web Engineering")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "CitiDirect 02: Frontend"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "CitiDirect 03: Production"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "CitiDirect 04: Frontend"})).not.toBeInTheDocument();
    expect(screen.queryByText("Apple Enterprise Systems")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open Velocity presentation" }));
    expect(window.location.search).toContain("project=velocity");
    for (const section of ["architecture", "performance", "results", "overview", "frontend"]) {
      fireEvent.keyDown(window, { key: "ArrowRight" });
      expect(window.location.search).toContain(`section=${section}`);
      if (section === "overview") expect(screen.getByText(/administrators create users, assign banking and account access/)).toBeInTheDocument();
      expect(window.location.search).toContain("role=web");
    }
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(window.location.search).not.toContain("project=");
    expect(window.location.search).toContain("role=web");
  });

  it("opens shared project details directly and preserves company on return", () => {
    window.history.replaceState(null, "", "/?view=present&company=standard-chartered&project=nextgen&section=frontend");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Schema-driven UI and modular delivery" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "React Library" })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(window.location.search).not.toContain("project=");
    expect(window.location.search).toContain("role=web");
  });
});


it("uses role=web for direct Velocity pages and gives explicit roles precedence over legacy companies", () => {
  window.localStorage.setItem("portfolio-language", "en");
  window.history.replaceState(null, "", "/?view=present&role=web&project=velocity&section=performance");
  const {unmount} = render(<App />);
  expect(screen.getByRole("heading", {name:"Less to load. Less blank-screen waiting."})).toBeInTheDocument();
  fireEvent.keyDown(window, {key:"ArrowLeft"});
  expect(window.location.search).toContain("section=architecture");
  unmount();
  window.history.replaceState(null, "", "/?view=present&role=fullstack&company=standard-chartered&section=why-role");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Why this role in Enterprise Systems" })).toBeInTheDocument();
  expect(screen.queryByText("Web Engineering")).not.toBeInTheDocument();
});


it("excludes Security and Production from direct Web links while retaining the Apple page", () => {
  window.localStorage.setItem("portfolio-language", "en");
  window.history.replaceState(null, "", "/?view=present&role=web&project=nextgen&section=production");
  const { unmount } = render(<App />);
  expect(screen.queryByRole("heading", { name: "From release checks to production support" })).not.toBeInTheDocument();
  expect(screen.getByText(/administrators create users, assign banking and account access/)).toBeInTheDocument();
  unmount();
  window.history.replaceState(null, "", "/?view=present&project=nextgen&section=production");
  render(<App />);
  expect(screen.getByRole("heading", { name: "From release checks to production support" })).toBeInTheDocument();
});
