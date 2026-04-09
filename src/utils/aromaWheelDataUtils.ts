import { aromaWheelData } from "@/data/aromaWheelData";

/* Small mapping object that holds aroma id-aroma name 
   key-value pairs.  */
export const aromaNameById: Record<string, string> = {};

/* Construct aromaNameById by essentially flattening the data
   found in aromaWheelData. Since the data is static, we can do this
   once. */
for (const category of aromaWheelData.categories) {
    for (const aroma of category.aromas) {
        aromaNameById[aroma.id] = aroma.name;
    }
}

export function getAromaName(id: string): string | undefined {
    return aromaNameById[id];
}
