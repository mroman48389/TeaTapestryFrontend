import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { PageID, pageIDs } from "@/constants/pages";

const selectedPageSlice = createSlice({
    name: "selectedPage",
    initialState: pageIDs.home as PageID,
    reducers: {
        setSelectedPageID: (state, action: PayloadAction<PageID>) => action.payload,
    },
});

export const { setSelectedPageID } = selectedPageSlice.actions;
export default selectedPageSlice.reducer;