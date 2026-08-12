import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("portfolio", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows the verified featured project and public contact only", () => {
    render(<App />);
    expect(screen.getByText(/Baby Food Buddy|辅食搭子/)).toBeInTheDocument();
    expect(screen.getByText("lsxj615@foxmail.com")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("15759266706");
  });

  it("switches language and remembers the selection", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "中" }));
    expect(screen.getByText("把复杂规则，做成")).toBeInTheDocument();
    expect(window.localStorage.getItem("portfolio-language")).toBe("zh");
  });
});
