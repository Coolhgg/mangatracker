import { render, screen } from "@testing-library/react";
import AddPage from "../app/(app)/add/page";
import React from "react";

describe("AddPage", () => {
  it("renders heading and inputs", () => {
    render(<AddPage />);
    expect(screen.getByText(/Add series/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mangadex/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });
});
