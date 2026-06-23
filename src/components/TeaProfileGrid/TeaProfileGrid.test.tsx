import { screen, fireEvent } from "@testing-library/react";

import { TeaProfileGrid } from "./TeaProfileGrid";
import { getSampleTeaProfile, renderWithStore } from "@/utils/test-utils";
import authReducer, { AuthState } from "@/store/auth/authSlice";

/* Define the shape of the Redux store for tests. */
export interface TestRootState {
    auth: AuthState;
}

const loggedInState: TestRootState = {
    auth: {
        isLoggedIn: true,
        user: { id: "1", email: "test@example.com" },
        accessToken: "fake",
    },
};

const loggedOutState: TestRootState  = {
    auth: {
        isLoggedIn: false,
        user: null,
        accessToken: null,
    },
};

describe("TeaProfileGrid", () => {

    test("Unit test: Renders the TeaProfileGrid with a Default column.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedOutState,
            }
        );

        /* The "Default" column heading should always exist. */
        expect(screen.getByText("Default")).toBeInTheDocument();

        /* Check that at least one of the fields is visible. */
        expect(screen.getByText("Long Jing")).toBeInTheDocument();
    });

    test("Unit test: Does not render the My Notes column when addNotes is false.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedOutState,
            }
        );

        /* The "My Notes" column heading should not exist. */
        expect(screen.queryByText("My Notes")).toBeNull();

        /* Check that the Textareas do not exist either. */
        expect(screen.queryByRole("textbox")).toBeNull();
    });

    test("Integration test: Renders the My Notes column when addNotes is true and the user is logged in.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedInState,
            }
        );

        const checkbox = screen.getByLabelText("Add my own notes");
        fireEvent.click(checkbox);

        expect(screen.getByText("My Notes")).toBeInTheDocument();

        /* At least one Textarea should appear. */
        expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    });

    test("Unit test: Renders exactly two columns when addNotes is false.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedOutState,
            }
        );

        expect(screen.getByTestId("name-label")).toBeInTheDocument();
        expect(screen.getByTestId("name-default-value")).toBeInTheDocument();
        expect(screen.queryByTestId("name-my-notes-value")).toBeNull();
    });

    test("Integration test: Renders exactly three columns when addNotes is true.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedInState,
            }
        );

        fireEvent.click(screen.getByLabelText("Add my own notes"));

        expect(screen.getByTestId("name-label")).toBeInTheDocument();
        expect(screen.getByTestId("name-default-value")).toBeInTheDocument();
        expect(screen.getByTestId("name-my-notes-value")).toBeInTheDocument();
    });

    test("Integration test: Updates the correct notes field when typing.", () => {
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedInState,
            }
        );

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
        renderWithStore(
            <TeaProfileGrid teaProfile={getSampleTeaProfile()} />,
            {
                reducer: { auth: authReducer },
                preloadedState: loggedInState,
            }
        );

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