import { 
    useState, 
    useCallback 
} from "react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from "@/components/ui/command";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

/**
 * Props for the ComboBox component.
 *
 * This is a generic component that allows the user to search for / select an item.
 *
 * @property items - A generic array of items to display.
 * 
 * @property groups? - Optional map object where keys are group labels of type string and
 * values are array of items of type T within those groups.
 * 
 * @property selectedItem - Which item the user selected.
 * 
 * @property onSelectItem - Event handler for when the user selects an item.
 * 
 * @property getItemName - Gets the name of an item.
 * 
 * @property itemPlaceholder - Optional string for showing text if there is no selected item yet.
 * 
 * @property className? - Optional className to change the style of the field showing the selected item.
 * 
 */
interface ComboBoxProps<T> {
    items: T[];
    groups?: Record<string, T[]>;
    selectedItem: T | null;
    onSelectItem: (item: T) => void;
    getItemName: (item: T) => string;
    itemPlaceholderText?: string;
    className?: string;
}
export function ComboBox<T>({
    items,
    groups,
    selectedItem,
    onSelectItem,
    getItemName,
    itemPlaceholderText = "Select an option",
    className
}: ComboBoxProps<T>) {
    /* Is the popover (the area which displays the list of items) open? */
    const [popoverOpen, setPopoverOpen] = useState(false);

    /* Event handler wrapper for when the user selects an item. */
    const handleSelectItem = useCallback(
        (item: T) => {
            onSelectItem(item);
            setPopoverOpen(false);
        },
        [onSelectItem]
    );

    const selectedItemName = selectedItem ? getItemName(selectedItem) : "";

    /* Renders a single item in the ComboBox. */
    const renderItem = (item: T) => {
        const itemName = getItemName(item);
        const isItemSelected = selectedItemName === itemName;

        return (
            <CommandItem
                key={itemName}
                value={itemName}
                onSelect={() => handleSelectItem(item)}
                className="cursor-pointer"
            >
                <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        isItemSelected ? "opacity-100" : "opacity-0"
                    )}
                />
                {itemName}
            </CommandItem>
        );
    };

    /* Reminder that all shadcn components ending in Trigger need asChild.
    
        aria-expanded communicates that the popover is open/closed to assisted technologies like screen readers. It is paired with aria-haspopup here to
        signal that a listbox is the type of control the user is opening/closing.
        
        The PopoverTrigger is the area that holds the user's selected item. It is named as such because clicking on it triggers the popover to open or
        close. 

        w-[var(--radix-popover-trigger-width)]: This ensures that the popover content and popover trigger have the same width.

        Object.entries(groups) returns an array of [key, value] pairs. Since we have "groups? : Record<string, T[]>", we know the keys are strings and
        the values are each arrays of type T. If groups were passed in, we render an array of <CommandGroup>s, each containing an array of items of type T 
        as rendered using renderItem. Otherwise, we render a single list of items of type T, not under any groups.
    */
    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
                asChild
                aria-expanded={popoverOpen}
                aria-haspopup="listbox"
                className="bg-linen-white text-dark-mahogany-brown"
            >
                <button
                    type="button"
                    className={cn(
                        "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                >
                    <span className={cn(!selectedItem && "text-muted-foreground")}>
                        {selectedItem ? selectedItemName : itemPlaceholderText}
                    </span>
                    
                    {
                        popoverOpen
                        ? <ChevronUp data-testid="chevron-up" className="ml-2 h-4 w-4 opacity-75" />
                        : <ChevronDown data-testid="chevron-down" className="ml-2 h-4 w-4 opacity-75" />
                    }
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="bg-linen-white text-dark-mahogany-brown w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                aria-label="Options"
            >
                <Command 
                    filter={(value, search) => {
                        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                    }}
                >
                    <CommandInput
                        placeholder="Search..."
                        aria-label="Search options"
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        {
                            groups
                            ? Object.entries(groups).map(([groupName, groupItems]) => (
                                <CommandGroup key={groupName} heading={groupName}>
                                    {groupItems.map(renderItem)}
                                </CommandGroup>
                            ))
                            : items.map(renderItem)
                        }
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
