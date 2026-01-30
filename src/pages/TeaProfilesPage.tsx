import { useEffect, useState } from "react";
import useSWR from "swr";

import useFetch from "@/hooks/useFetch";
// import {log} from "./../utils/log-utils";
import { TeaProfilesResponse } from "@/types/serverResponses";
import { AromaWheel } from "@/components/AromaWheel/AromaWheel";

export default function TeaProfilesPage() {
    const { get } = useFetch(import.meta.env.VITE_API_URL);
    /* Note that SWR triggers multiple state transitions, so you will get multiple renders. */
    const { isLoading, error } = useSWR<TeaProfilesResponse>("/api/v1/tea_profiles", get);
    const [interactive, setInteractive] = useState(true);

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 768px)');
        const update = (e: MediaQueryList | MediaQueryListEvent) => {
        setInteractive(!e.matches); // disable interactivity on small screens
        };
        update(mql);
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const aromaWheelData = {
        categories: [
            {
                id: "flowers",
                name: "Flowers",
                color: "#E6A8D7",
                aromas: [
                    { id: "chrysanthemum", name: "Chrysanthemum" },
                    { id: "dandelion", name: "Dandelion" },
                    { id: "gardenia", name: "Gardenia" },
                    { id: "honeysuckle", name: "Honeysuckle" },
                    { id: "jasmine", name: "Jasmine" },
                    { id: "lavender", name: "Lavender" },
                    { id: "osmanthus", name: "Osmanthus" },
                    { id: "roses", name: "Roses" }
                ]
            },

            {
                id: "fruit",
                name: "Fruit",
                color: "#F7C46C",
                aromas: [
                    { id: "apple", name: "Apple" },
                    { id: "apricot", name: "Apricot" },
                    { id: "banana", name: "Banana" },
                    { id: "blackberry", name: "Blackberry" },
                    { id: "blueberry", name: "Blueberry" },
                    { id: "cantaloupe", name: "Cantaloupe" },
                    { id: "cherry", name: "Cherry" },
                    { id: "coconut", name: "Coconut" },
                    { id: "date", name: "Date" },
                    { id: "fig", name: "Fig" },
                    { id: "grapes", name: "Grapes" },
                    { id: "guava", name: "Guava" },
                    { id: "honeydew", name: "Honeydew" },
                    { id: "kiwi", name: "Kiwi" },
                    { id: "lemon", name: "Lemon" },
                    { id: "lime", name: "Lime" },
                    { id: "lychee", name: "Lychee" },
                    { id: "mango", name: "Mango" },
                    { id: "orange", name: "Orange" },
                    { id: "papaya", name: "Papaya" },
                    { id: "passionfruit", name: "Passionfruit" },
                    { id: "peach", name: "Peach" },
                    { id: "pear", name: "Pear" },
                    { id: "persimmon", name: "Persimmon" },
                    { id: "pineapple", name: "Pineapple" },
                    { id: "prune", name: "Prune" },
                    { id: "raisins", name: "Raisins" },
                    { id: "raspberry", name: "Raspberry" },
                    { id: "starfruit", name: "Starfruit" },
                    { id: "strawberry", name: "Strawberry" },
                    { id: "tangerine", name: "Tangerine" },
                    { id: "watermelon", name: "Watermelon" }
                ]
            },

            {
                id: "grains",
                name: "Grains",
                color: "#D9CBA3",
                aromas: [
                    { id: "barley", name: "Barley" },
                    { id: "oats", name: "Oats" },
                    { id: "rice", name: "Rice" },
                    { id: "wheat", name: "Wheat" }
                ]
                },

                {
                id: "herbs",
                name: "Herbs",
                color: "#8BCB9C",
                aromas: [
                    { id: "basil", name: "Basil" },
                    { id: "mint", name: "Mint" },
                    { id: "parsely", name: "Parsely" },
                    { id: "sage", name: "Sage" },
                    { id: "thyme", name: "Thyme" }
                ]
            },

            {
                id: "milk",
                name: "Milk",
                color: "#F2E6D8",
                aromas: [
                    { id: "butter", name: "Butter" },
                    { id: "cheese", name: "Cheese" },
                    { id: "cream", name: "Cream" },
                    { id: "fresh-milk", name: "Fresh milk" },
                    { id: "yogurt", name: "Yogurt" }
                ]
            },

            {
                id: "nuts",
                name: "Nuts",
                color: "#C9A27C",
                aromas: [
                    { id: "almond", name: "Almond" },
                    { id: "cashew", name: "Cashew" },
                    { id: "chesnut", name: "Chesnut" },
                    { id: "hazelnut", name: "Hazelnut" },
                    { id: "walnut", name: "Walnut" }
                ]
            },

            {
                id: "other",
                name: "Other",
                color: "#B4B4C7",
                aromas: [
                    { id: "alcohol", name: "Alcohol" },
                    { id: "barn", name: "Barn" },
                    { id: "books-library", name: "Books/Library" },
                    { id: "broth-stock", name: "Broth/Stock" },
                    { id: "cedar", name: "Cedar" },
                    { id: "coffee", name: "Coffee" },
                    { id: "crab", name: "Crab" },
                    { id: "eucalyptus", name: "Eucalyptus" },
                    { id: "forest-floor", name: "Forest floor" },
                    { id: "gasoline", name: "Gasoline" },
                    { id: "grass", name: "Grass" },
                    { id: "hay", name: "Hay" },
                    { id: "leather", name: "Leather" },
                    { id: "lobster", name: "Lobster" },
                    { id: "minerals", name: "Minerals" },
                    { id: "miso", name: "Miso" },
                    { id: "musk", name: "Musk" },
                    { id: "oak", name: "Oak" },
                    { id: "pine", name: "Pine" },
                    { id: "rubber", name: "Rubber" },
                    { id: "sea-air", name: "Sea air" },
                    { id: "seaweed", name: "Seaweed" },
                    { id: "smoke", name: "Smoke" },
                    { id: "soil", name: "Soil" },
                    { id: "soy-sauce", name: "Soy sauce" },
                    { id: "tobacco", name: "Tobacco" }
                ]
            },

            {
                id: "spices",
                name: "Spices",
                color: "#DFA06E",
                aromas: [
                    { id: "allspice", name: "Allspice" },
                    { id: "cardamom", name: "Cardamom" },
                    { id: "cinnamon", name: "Cinnamon" },
                    { id: "clove", name: "Clove" },
                    { id: "coriander", name: "Coriander" },
                    { id: "ginger", name: "Ginger" },
                    { id: "licorice", name: "Licorice" },
                    { id: "nutmeg", name: "Nutmeg" },
                    { id: "peppercorn", name: "Peppercorn" },
                    { id: "smoked-paprika", name: "Smoked paprika" },
                    { id: "turmeric", name: "Turmeric" }
                ]
            },

            {
                id: "sweets-baked-goods",
                name: "Sweets/Baked Goods",
                color: "#E8C3A0",
                aromas: [
                    { id: "bread-toast", name: "Bread/Toast" },
                    { id: "brown-sugar", name: "Brown Sugar" },
                    { id: "caramel", name: "Caramel" },
                    { id: "chocolate", name: "Chocolate" },
                    { id: "cotton-candy", name: "Cotton candy" },
                    { id: "croissant", name: "Croissant" },
                    { id: "honey", name: "Honey" },
                    { id: "malt", name: "Malt" },
                    { id: "maple-syrup", name: "Maple syrup" },
                    { id: "marzipan", name: "Marzipan" },
                    { id: "nougat", name: "Nougat" },
                    { id: "sourdough", name: "Sourdough" },
                    { id: "toffee", name: "Toffee" },
                    { id: "vanilla", name: "Vanilla" },
                    { id: "yeast", name: "Yeast" }
                ]
            },

            {
                id: "vegetables",
                name: "Vegetables",
                color: "#9BCB7D",
                aromas: [
                    { id: "asparagus", name: "Asparagus" },
                    { id: "bell-pepper", name: "Bell pepper" },
                    { id: "broccoli", name: "Broccoli" },
                    { id: "butternut-squash", name: "Butternut Squash" },
                    { id: "cucumber", name: "Cucumber" },
                    { id: "green-beans", name: "Green beans" },
                    { id: "mushroom", name: "Mushroom" },
                    { id: "peas", name: "Peas" },
                    { id: "spinach", name: "Spinach" },
                    { id: "tomato", name: "Tomato" }
                ]
            }
        ]
    };


    // return (<></>);
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    // console.log("Tea profiles response:", data);
    // return <pre>{JSON.stringify(data, null, 2)}</pre>;

    return (
        <div
            style={{
                maxWidth: 640,
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                touchAction: 'none', // required for pinch-zoom
            }}
        >
            <AromaWheel
                data={aromaWheelData}
                size={640}
                gapAngleRad={0.02}
                interactive={interactive}
                // onAromaClick={(aroma, category) => {
                //     // zoom-out + tapestry logic here
                // }}
            />
        </div>
    );
}