const skip = !!process.env.CI;

import { TeaProfilesResponseSchema } from "../src/schemas/teaProfiles";

/* 
    Validates that /api/v1/tea_profiles returns data matching 
    TeaProfileFiltersSchema. 
*/

(skip ? describe.skip : describe)("Contract tests", () => {
  test("GET /api/v1/tea_profiles with filters matches contract", async () => {
    const res = await fetch(
      "http://localhost:8000/api/v1/tea_profiles?tea_type=green"
    );
    const json = await res.json();

    const parsed = TeaProfilesResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });
});
