import { render, screen } from "@testing-library/react";
import { RequireAuth } from "./RequireAuth";

test("RequireAuth renders children", () => {
    render(
        <RequireAuth>
            <div>Child content</div>
        </RequireAuth>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
});
