import { RawCode } from "./RawCode.js";

describe("RawCode", () => {
  test("code", () => {
    expect(new RawCode("some code").toString()).toBe("some code");
  });
});
