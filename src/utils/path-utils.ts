import { Pages, PageID, pageIDs } from "@/constants/pages";

export function getPageIDFromPath(path: string): PageID {
    for (const id of Object.keys(Pages) as PageID[]) {
        if (Pages[id].path === path) {
            return id;
        }
    }

    return pageIDs.home; // fallback
}
