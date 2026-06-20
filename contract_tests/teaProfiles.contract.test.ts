const skip = !!process.env.CI;

import { TeaProfilesResponseSchema } from "../src/schemas/teaProfiles";

/* 
    Validates that /api/v1/tea_profiles returns data matching 
    TeaProfilesResponseSchema and TeaProfileSchema. 
*/

(skip ? describe.skip : describe)("Contract tests", () => {
  test("GET /api/v1/tea_profiles", async () => {
    const res = await fetch(
      "http://localhost:8000/api/v1/tea_profiles"
    );
    const json = await res.json();

    const parsed = TeaProfilesResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });
});