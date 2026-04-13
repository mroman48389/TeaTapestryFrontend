import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ComboBox } from "./ComboBox";

interface Item {
    id: number;
    name: string;
}

const items: Item[] = [
    { id: 1, name: "Cat" },
    { id: 2, name: "Dog" },
    { id: 3, name: "Parrot" },
];

const groups = {
    Mammals: [
        { id: 1, name: "Cat" },
        { id: 2, name: "Dog" },
    ],
    Birds: [
        { id: 3, name: "Parrot" },
    ],
};

const getItemName = (item: Item) => item.name;

function renderComboBox(props?: Partial<React.ComponentProps<typeof ComboBox<Item>>>) {
    const onSelectItem = jest.fn();

    render(
        <ComboBox<Item>
            items={items}
            groups={undefined}
            selectedItem={null}
            onSelectItem={onSelectItem}
            getItemName={getItemName}
            {...props}
        />
    );

    return { onSelectItem };
}

describe("ComboBox", () => {

    test("Unit test: Renders placeholder text when no item is selected.", () => {
        renderComboBox({ itemPlaceholderText: "Pick one" });

        expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    test("Unit test: Renders selected item text when an item is selected.", () => {
        renderComboBox({ selectedItem: items[1] });

        expect(screen.getByText("Dog")).toBeInTheDocument();
    });

    test("Unit test: Opens the popover when clicked.", async () => {
        renderComboBox();

        const user = userEvent.setup();

        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    test("Unit test: Toggles the chevron icon when opened/closed.", async () => {
        renderComboBox();

        const user = userEvent.setup();

        const trigger = screen.getByRole("button");

        /* The ComboBox should start closed, so the down chevron should be there now. */
        expect(screen.getByTestId("chevron-down")).toBeInTheDocument();

        await user.click(trigger);

        /* After clicking the trigger, the popover will be up and the up chevron should be there. */
        expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    });

    test("Unit test: Renders items when no groups are provided.", async () => {
        renderComboBox();

        const user = userEvent.setup();

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("Cat")).toBeInTheDocument();
        expect(screen.getByText("Dog")).toBeInTheDocument();
        expect(screen.getByText("Parrot")).toBeInTheDocument();
    });

    test("Unit test: Renders grouped items when groups are provided.", async () => {
        renderComboBox({ groups });

        const user = userEvent.setup();

        await user.click(screen.getByRole("button"));

        expect(screen.getByText("Mammals")).toBeInTheDocument();
        expect(screen.getByText("Birds")).toBeInTheDocument();

        expect(screen.getByText("Cat")).toBeInTheDocument();
        expect(screen.getByText("Parrot")).toBeInTheDocument();
    });

    test("Unit test: Filters items based on search input.", async () => {
        renderComboBox();

        const user = userEvent.setup();

        /* The trigger has to be clicked first to bring up the Search. */
        await user.click(screen.getByRole("button"));

        /* Mimic the user typing in "at" to find "Cat". */
        const input = screen.getByRole("combobox");
        await user.type(input, "at");

        expect(screen.getByText("Cat")).toBeInTheDocument();
        expect(screen.queryByText("Dog")).not.toBeInTheDocument();
        expect(screen.queryByText("Parrot")).not.toBeInTheDocument();
    });

    test("Unit test: Calls onSelectItem when an item is selected.", async () => {
        const { onSelectItem } = renderComboBox();

        const user = userEvent.setup();

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByText("Parrot"));

        expect(onSelectItem).toHaveBeenCalledWith(items[2]);
    });

    test("Unit test: Closes the popover after selecting an item.", async () => {
        renderComboBox();

        const user = userEvent.setup();

        await user.click(screen.getByRole("button"));
        await user.click(screen.getByText("Dog"));

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    test("Unit test: Applies custom className to the trigger button.", () => {
        renderComboBox({ className: "bg-red-500" });

        const trigger = screen.getByRole("button");
        expect(trigger).toHaveClass("bg-red-500");
    });
});
