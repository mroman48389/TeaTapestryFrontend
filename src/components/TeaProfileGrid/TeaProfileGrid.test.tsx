import { render, screen, fireEvent } from "@testing-library/react";

import { TeaProfileGrid } from "./TeaProfileGrid";
import { getSampleTeaProfile } from "@/utils/test-utils";

describe("TeaProfileGrid", () => {

    test("Unit test: Renders the TeaProfileGrid with a Default column.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        /* The "Default" column heading should always exist. */
        expect(screen.getByText("Default")).toBeInTheDocument();

        /* Check that at least one of the fields is visible. */
        expect(screen.getByText("Long Jing")).toBeInTheDocument();
    });

    test("Unit test: Does not render the My Notes column when addNotes is false.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        /* The "My Notes" column heading should not exist. */
        expect(screen.queryByText("My Notes")).toBeNull();

        /* Check that the Textareas do not exist either. */
        expect(screen.queryByRole("textbox")).toBeNull();
    });

    test("Integration test: Renders the My Notes column when addNotes is true.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        const checkbox = screen.getByLabelText("Add my own notes");
        fireEvent.click(checkbox);

        expect(screen.getByText("My Notes")).toBeInTheDocument();

        /* At least one Textarea should appear. */
        expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    });

    test("Unit test: Renders exactly two columns when addNotes is false.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        expect(screen.getByTestId("name-label")).toBeInTheDocument();
        expect(screen.getByTestId("name-default-value")).toBeInTheDocument();
        expect(screen.queryByTestId("name-my-notes-value")).toBeNull();
    });

    test("Integration test: Renders exactly three columns when addNotes is true.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        fireEvent.click(screen.getByLabelText("Add my own notes"));

        expect(screen.getByTestId("name-label")).toBeInTheDocument();
        expect(screen.getByTestId("name-default-value")).toBeInTheDocument();
        expect(screen.getByTestId("name-my-notes-value")).toBeInTheDocument();
    });

    test("Integration test: Updates the correct notes field when typing.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        fireEvent.click(screen.getByLabelText("Add my own notes"));

        const textarea = screen.getByTestId("textarea-alternative_names");
        const counter = screen.getByTestId("char-counter-alternative_names");

        /* Text area should start blank. */
        expect(counter).toHaveTextContent("200 characters left");

        fireEvent.change(textarea, { target: { value: "My alt name" } }); // 11 characters total

        expect(textarea).toHaveValue("My alt name");
        expect(counter).toHaveTextContent("189 characters left"); // 200 - 11
    });

    test("Integration test: Preserves notes when toggling addNotes off and on.", () => {
        render(<TeaProfileGrid teaProfile={getSampleTeaProfile()} />);

        const checkbox = screen.getByLabelText("Add my own notes");
        fireEvent.click(checkbox);

        const textarea = screen.getByPlaceholderText("Enter alternative name(s).");
        fireEvent.change(textarea, { target: { value: "Saved text" } });

        /* Hide notes */
        fireEvent.click(checkbox);

        /* Show notes again */
        fireEvent.click(checkbox);

        const textareaAgain = screen.getByPlaceholderText("Enter alternative name(s).");
        expect(textareaAgain).toHaveValue("Saved text");
    });

});