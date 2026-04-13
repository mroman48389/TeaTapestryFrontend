import { render, screen, fireEvent } from "@testing-library/react";
import NavSidebarToggle from "./NavSidebarToggle";

describe("NavSidebarToggle", () => {

    test("Renders the toggle button.", () => {
        render(<NavSidebarToggle open={false} onToggleClick={() => {}} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("Calls onToggleClick when clicked.", () => {
        const mockClick = jest.fn();
        render(<NavSidebarToggle open={false} onToggleClick={mockClick} />);
        fireEvent.click(screen.getByRole("button"));
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    test("Applies rotation class when open.", () => {
        render(<NavSidebarToggle open={true} onToggleClick={() => {}} />);
        const icon = screen.getByTestId("nav-sidebar-toggle-icon");
        expect(icon).toHaveClass("rotate-0");
    });

    test("Does not apply rotation class when closed.", () => {
        render(<NavSidebarToggle open={false} onToggleClick={() => {}} />);
        const icon = screen.getByTestId("nav-sidebar-toggle-icon");
        expect(icon).not.toHaveClass("rotate-0");
    });
    
});