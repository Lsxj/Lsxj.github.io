import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("portfolio", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("shows the verified featured project and public contact only", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Baby Food Buddy|辅食搭子/ })).toBeInTheDocument();
    expect(screen.getByText(/live AI agent product|已经上线的 AI Agent/)).toBeInTheDocument();
    expect(screen.getByText(/300\+ users|300\+ 用户/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:lsxj615@foxmail.com");
    expect(document.body).not.toHaveTextContent("15759266706");
  });

  it("switches language and remembers the selection", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "中" }));
    expect(screen.getByText(/喜欢把复杂的问题做成清晰、可靠/)).toBeInTheDocument();
    expect(screen.getByText(/软件工程和经济学双学位/)).toBeInTheDocument();
    expect(screen.getByText(/直接管理和辅导 6 名中国工程师/)).toBeInTheDocument();
    expect(screen.getByText("2017—至今")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "花旗 · AVP / 高级软件工程师" })).toBeInTheDocument();
    expect(screen.getByText(/150 个国家的近 10 万名机构投资者/)).toBeInTheDocument();
    expect(screen.getByText(/2018\.07—2019\.01/)).toBeInTheDocument();
    expect(window.localStorage.getItem("portfolio-language")).toBe("zh");
  });

  it("navigates through project pages without a modal", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Open project: Baby Food Buddy|打开项目: 辅食搭子/ }));
    expect(screen.getByRole("heading", { level: 1, name: /Baby Food Buddy|辅食搭子/ })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.location.search).toContain("project=fushi");

    fireEvent.click(screen.getByRole("button", { name: /Next project|下一个项目/ }));
    expect(screen.getByRole("heading", { level: 1, name: "CitiDirect NextGen" })).toBeInTheDocument();
    expect(window.location.search).toContain("project=nextgen");
  });
});
