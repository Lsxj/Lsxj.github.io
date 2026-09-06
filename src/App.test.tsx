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
    expect(screen.getByRole("heading", { name: /Baby Food Buddy|辅食搭子/ })).toBeInTheDocument();
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
    expect(screen.getByText("2017—至今")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "花旗 · AVP / 高级软件工程师" })).toBeInTheDocument();
    expect(screen.getByText(/150 个国家近 10 万名机构投资者/)).toBeInTheDocument();
    expect(screen.getByText(/2018\.07—2019\.01/)).toBeInTheDocument();
    expect(window.localStorage.getItem("portfolio-language")).toBe("zh");
  });

  it("keeps project details available only in presentation mode", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);

    expect(screen.getByRole("heading", { level: 2, name: /I care about the whole product|我关注完整的产品/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Baby Food Buddy|辅食搭子/ })).toBeInTheDocument();
    expect(screen.getByText(/Xiamen University · Software Engineering & Economics|厦门大学 · 软件工程与经济学双学位/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exit" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Presentation page shortcuts" })).toBeInTheDocument();

    const presentationButton = screen.getByRole("button", { name: /Open CitiDirect presentation|进入 CitiDirect 项目展示/ });
    expect(presentationButton).toBeEnabled();
    fireEvent.click(presentationButton);
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Back to introduction/ })).not.toBeInTheDocument();
    expect(window.location.search).toContain("view=present");
    expect(window.location.search).toContain("project=nextgen");
  });

  it("jumps directly between presentation pages from the hidden dock", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Baby Food Buddy 02: Agent & MCP" }));
    expect(screen.getByRole("heading", { level: 1, name: "Controlled Agent Execution" })).toBeInTheDocument();
    expect(window.location.search).toContain("project=fushi");
    expect(window.location.search).toContain("section=agent");

    fireEvent.click(screen.getByRole("button", { name: "CitiDirect 04: Frontend" }));
    expect(screen.getByRole("heading", { level: 1, name: "Schema-driven UI on a modular frontend" })).toBeInTheDocument();
    expect(window.location.search).toContain("project=nextgen");
    expect(window.location.search).toContain("section=frontend");
  });

  it("moves forward and backward through the presentation with arrow keys", () => {
    window.history.replaceState(null, "", "/?view=present");
    render(<App />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { level: 2, name: "I care about the whole product." })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CitiDirect 06: Result" }));
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1, name: "Baby Food Buddy" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Baby Food Buddy 03: Feedback" }));
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 2, name: "I care about the whole product." })).toBeInTheDocument();
  });

  it("opens direct project routes in presentation mode", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=backend");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /Managing users and access across systems|跨系统的用户与权限管理/ })).toBeInTheDocument();
    expect(screen.getByText("Core User Service")).toBeInTheDocument();
    expect(screen.getByText("Persona Service")).toBeInTheDocument();
    expect(screen.getByText(/Shared Spring Security library|共享 Spring Security 库/)).toBeInTheDocument();
    expect(screen.getByText(/each business service enforces|各业务服务执行自身/)).toBeInTheDocument();
    expect(screen.getByText(/layout metadata/i)).toBeInTheDocument();
    expect(screen.getByText("Criteria Service")).toBeInTheDocument();
    expect(screen.getByText("Audit Service")).toBeInTheDocument();
    expect(screen.getByText("CDC Listener")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /CitiDirect case study pages|CitiDirect 案例分页/ })).toBeInTheDocument();
  });

  it("combines project context and workflow changes on the overview page", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=overview");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect Nextgen Entitlements" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Reusable entitlement personas|可复用权限 Persona/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Event-driven onboarding|事件驱动开户/ })).toBeInTheDocument();
    expect(screen.getByText(/Case page 01 \/ 06|案例页 01 \/ 06/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approach|整体方案/ })).not.toBeInTheDocument();
  });

  it("distinguishes the user-journey team's scope from personal contributions", () => {
    window.history.replaceState(null, "", "/?view=present&project=nextgen&section=scope");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /My role: Tech Lead & hands-on engineer|我的角色：技术负责人，也是核心开发者/ })).toBeInTheDocument();
    expect(screen.getByText(/Six teams built Entitlements|六个团队共同建设/)).toBeInTheDocument();
    expect(screen.getByText(/Checker approval & rejection|Checker 审批与拒绝/)).toBeInTheDocument();
    expect(screen.getByText(/Automated onboarding: initial user creation|自动接入入口：初始用户创建/)).toBeInTheDocument();
    expect(screen.getByText(/Core User Service \+ React permission workflow|核心 User Service \+ React 权限流程/)).toBeInTheDocument();
    expect(screen.getByText(/other five teams|其他五个团队/)).toBeInTheDocument();
  });

  it("presents Baby Food Buddy as a live end-to-end product", () => {
    window.history.replaceState(null, "", "/?view=present&project=fushi&section=overview");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Baby Food Buddy" })).toBeInTheDocument();
    expect(screen.getByText("A live full-stack product for everyday feeding decisions")).toBeInTheDocument();
    expect(screen.getByText(/Sole end-to-end owner/)).toBeInTheDocument();
    expect(screen.getByText("300+")).toBeInTheDocument();
  });

  it("makes application-controlled Agent execution the primary design decision", () => {
    window.history.replaceState(null, "", "/?view=present&project=fushi&section=agent");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Controlled Agent Execution" })).toBeInTheDocument();
    expect(screen.getByText("Application control")).toBeInTheDocument();
    expect(screen.getByText("Validate & authorize")).toBeInTheDocument();
    expect(screen.getByText(/Identity comes from the trusted session; only application code can allow execution/)).toBeInTheDocument();
    expect(screen.getByText(/Preview & confirmation/)).toBeInTheDocument();
    expect(screen.getByText("Reuse the same application control")).toBeInTheDocument();
    expect(screen.getByText(/describe implementation scope only/)).toBeInTheDocument();
    expect(screen.queryByText(/Agent Lab|does not serve the Mini Program/)).not.toBeInTheDocument();
  });

  it("connects real user reports to safe investigation and reproducible fixes", () => {
    window.history.replaceState(null, "", "/?view=present&project=fushi&section=fullstack");
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "From User Reports to Reproducible Fixes" })).toBeInTheDocument();
    expect(screen.getByText("React console I use to investigate real user reports")).toBeInTheDocument();
    expect(screen.getByText("Safe investigation")).toBeInTheDocument();
    expect(screen.getByText("Fix & release")).toBeInTheDocument();
    expect(screen.getByText(/allergy records remain read-only/)).toBeInTheDocument();
    expect(screen.getByText("Presentation page 03 / 03")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Return to.*Introduction/ }));
    expect(window.location.search).toBe("?view=present");
    expect(screen.getByRole("heading", { level: 2, name: "I care about the whole product." })).toBeInTheDocument();
  });

  it("redirects old project-detail URLs to the portfolio homepage", () => {
    window.history.replaceState(null, "", "/?project=fushi&section=agent");
    render(<App />);
    expect(window.location.search).toBe("");
    expect(screen.getByRole("heading", { name: /Selected projects|精选项目/ })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /case study pages|案例分页/ })).not.toBeInTheDocument();
  });
});
