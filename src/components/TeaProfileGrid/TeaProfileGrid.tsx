import clsx from "clsx";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { TeaProfile } from "@/schemas/teaProfiles";
import { UserTeaProfileNotes, UserTeaProfileNotesSchema } from "@/schemas/userTeaProfileNotes";
import { getLastMonthAndYear } from "@/utils/utils";

/**
 * Props for the TeaProfileGrid component.
 *
 * This is a domain component that fully displays TeaProfile data and allows the
 * user to enter their own data.
 *
 * @property teaProfile - A TeaProfile that contains all possible tea profile data 
 * that can be displayed. 
 * 
 */
interface TeaProfileGridProps {
    teaProfile: TeaProfile;
}

export function TeaProfileGrid({ teaProfile }: TeaProfileGridProps) {
    const [addNotes, setAddNotes] = useState(false);
    const [notes, setNotes] = useState<UserTeaProfileNotes>(UserTeaProfileNotesSchema.parse({}));

    /* We make renderTextArea a generic function with a type parameter of K. "keyof UserTeaProfileNotes"
       is a union of all valid keys in UserTeaProfileNotes (i.e. : "alternative_names | subregions | ..."). 
       "K extends" forces K to be only one of those keys, so we get full type safety. This allows us to safely
       pass in the name of the field of UserTeaProfileNotes we wish to set notes for without worrying about
       misspellings. */
    const renderTextArea = <
        K extends keyof UserTeaProfileNotes
    >(
        userTeaProfileNotesField: K, placeholderText: string, opts: {maxChars?: number} = {}
    ) => {
        const {
            maxChars = 1000
        } = opts;

        return (
            <>
                {addNotes ? 
                    <div className="flex flex-col gap-1">
                        <Textarea
                            placeholder={placeholderText}
                            className="h-10 w-full resize-none overflow-auto"
                            maxLength={maxChars}
                            onChange={(e) => setNotes({
                            ...notes,
                            [userTeaProfileNotesField]: e.target.value
                        })}
                            value={notes[userTeaProfileNotesField]}
                    />

                        <small className="text--small text-right opacity-70">
                            {maxChars - notes[userTeaProfileNotesField].length} characters left
                        </small>
                    </div> : 
                null}
            </>
        );
    };

    /* Use "grid-column: 1 / -1;" (col-span-full in Tailwind) to take up the entire next available row in the grid. This will be useful for rows where
       we want a horizontal divider effect. For such rows, instead of 2 to 3 separate items in that row, we wrap those 2 to 3 separate items in a div
       and force that div to span the entire row. This allows us to give a horizontal divider line that behaves appropriately. Then we make the div
       a grid as well with one row and 2 or 3 columns. */
    return (
        <>
            <div className="my-3 flex items-center space-x-2">
                <Checkbox id="add-my-own-notes" className="text--body" checked={addNotes} onCheckedChange={checked => setAddNotes(checked === true)}/>

                <label
                    htmlFor="add-my-own-notes"
                    className="text--body"
                >
                    Add my own notes
                </label>
            </div>

            <div
                className={clsx(
                    "bg-linen-white grid gap-x-2 gap-y-4 rounded-xl border px-3 pb-3",
                    (!addNotes) && "grid-cols-[200px_1fr]",
                    addNotes && "grid-cols-[200px_1fr_1fr]"
                )}
            >

                {/* ---------------   Column headers   ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b py-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <div/>
                        <p className="text-grid-heading">Default</p>
                        {addNotes && <p className="text-grid-heading">My Notes</p>}
                    </div>
                </div>

                {/* ---------------   Name   ---------------- */}

                <p className="text-grid-heading">Name</p>
                <p className="text-grid-data">{teaProfile.name}</p>
                {addNotes && <p className="text-grid-data">-</p>}

                {/* ---------------   Alternative Names   ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Alternative Names</p>
                        <p className="text-grid-data">{teaProfile.alternative_names.join(", ")}</p>
                        {renderTextArea("alternative_names", "Enter alternative name(s).", {maxChars: 200})}
                    </div>
                </div>

                {/* ----------------   Origin   --------------- */}

                <p className="text-grid-heading">Origin</p>
                <p className="text-grid-data">{teaProfile.country_of_origin}</p>
                {addNotes && <p className="text-grid-data">-</p>}

                {/* ----------------   Subregions   --------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Subregion(s)</p>
                        <p className="text-grid-data">{teaProfile.subregions.join(", ")}</p>
                        {renderTextArea("subregions", "Enter the subregion the tea came from.", {maxChars: 200})}
                    </div>
                </div>

                {/* ---------------   Cultural Significance   ---------------- */}

                <p className="text-grid-heading">Cultural Significance</p>
                <p className="text-grid-data">{teaProfile.cultural_significance}</p>
                {renderTextArea("cultural_significance", "Describe the cultural significance of this tea.")}

                {/* ---------------   Cultural Significance Source(s)   ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Cultural Significance Source(s)</p>
                        <p className="text-grid-data">{teaProfile.cultural_significance_source}</p>
                        {renderTextArea("cultural_significance_source", "Enter sources.")}
                    </div>
                </div>

                {/* ----------------   Type   --------------- */}

                <p className="text-grid-heading">Type</p>
                <p className="text-grid-data">{teaProfile.tea_type}</p>
                {addNotes && <p className="text-grid-data">-</p>}

                {/* ---------------   Oxidation Level   ---------------- */}

                <p className="text-grid-heading">Oxidation Level</p>
                <p className="text-grid-data">{teaProfile.oxidation_level}</p>
                {renderTextArea("oxidation_level", "Enter oxidation level.", {maxChars: 50})}

                {/* ---------------   Cultivars   ---------------- */}

                <p className="text-grid-heading">Cultivars</p>
                <p className="text-grid-data">{teaProfile.cultivars.join(", ")}</p>
                {renderTextArea("cultivars", "Enter the cultivar(s) used.", {maxChars: 200})}

                {/* ---------------   Processing   ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Processing</p>
                        <p className="text-grid-data">{teaProfile.processing}</p>
                        {renderTextArea("processing", "Describe how this tea was processed.")}
                    </div>
                </div>

                {/* ---------------   Mass-market Price Range and Median Price   ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Mass-market Price Range and Median Price (USD) for {getLastMonthAndYear()}</p>
                        <p className="text-grid-data">Coming soon</p>
                        {renderTextArea("pricing", "Enter pricing information.", {maxChars: 200})}
                    </div>
                </div>

                {/* ----------------    Dry Leaf Appearance    --------------- */}

                <p className="text-grid-heading">Dry Leaf Appearance</p>
                <p className="text-grid-data">{teaProfile.dry_leaf_appearance.join(", ")}</p>
                {renderTextArea("dry_leaf_appearance", "Describe the color, shape, texture, and other visual attributes of the dry leaves.")}

                {/* -----------------   Dry Leaf Aroma   -------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Dry Leaf Aroma</p>
                        <p className="text-grid-data">{teaProfile.dry_leaf_aroma.join(", ")}</p>
                        {renderTextArea("dry_leaf_aroma", "Describe the scent of the dry leaves.")}
                    </div>
                </div>

                {/* ----------------   Liquor Appearance   --------------- */}

                <p className="text-grid-heading">Liquor Appearance</p>
                <p className="text-grid-data">{teaProfile.liquor_appearance.join(", ")}</p>
                {renderTextArea("liquor_appearance", "Describe the appearance of the tea liquor, including its color and clarity.")}

                {/* ---------------   Liquor Aroma   ---------------- */}

                <p className="text-grid-heading">Liquor Aroma</p>
                <p className="text-grid-data">{teaProfile.liquor_aroma.join(", ")}</p>
                {renderTextArea("liquor_aroma", "Describe the scent the tea gives off.")}

                {/* -----------------   Liquor Taste   -------------- */}

                <p className="text-grid-heading">Liquor Taste</p>
                <p className="text-grid-data">{teaProfile.liquor_taste.join(", ")}</p>
                {renderTextArea("liquor_taste", "Describe what the tea tastes like.")}

                {/* ---------------   Liquor Body / Mouthfeel    ---------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Liquor Body / Mouthfeel</p>
                        <p className="text-grid-data">{teaProfile.liquor_body_mouthfeel.join(", ")}</p>
                        {renderTextArea("liquor_body_mouthfeel", "Describe the body of the tea and the effect it has on your mouth.")}
                    </div>
                </div>

                {/* -----------------   Body Effect   -------------- */}

                <div className="border-wood-bowl-brown col-span-full border-b pb-3">
                    <div className="grid grid-cols-[200px_1fr_1fr] gap-x-2">
                        <p className="text-grid-heading">Body Effect</p>
                        <p className="text-grid-data">{teaProfile.body_effect.join(", ")}</p>
                        {renderTextArea("body_effect", "Describe any effects the tea has on your body as a whole.")}
                    </div>
                </div>

                {/* -----------------   Wet Leaf Appearance   -------------- */}

                <p className="text-grid-heading">Wet Leaf Appearance</p>
                <p className="text-grid-data">{teaProfile.wet_leaf_appearance.join(", ")}</p>
                {renderTextArea("wet_leaf_appearance", "Describe the color, shape, texture, and other visual attributes of the wet leaves.")}

                {/* -----------------   Wet Leaf Aroma   -------------- */}

                <p className="text-grid-heading">Wet Leaf Aroma</p>
                <p className="text-grid-data">{teaProfile.wet_leaf_aroma.join(", ")}</p>
                {renderTextArea("wet_leaf_aroma", "Describe the scent of the wet leaves.")}

            </div>
        </>
    );
}