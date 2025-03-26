import { Value } from "./Value.js";

describe("Value", () => {
  test("integer", () => {
    const val = new Value("integer", 3);
    expect(val.toString()).toBe("3");
  });

  test("string", () => {
    const val = new Value("string", "foo");
    expect(val.toString()).toBe('"foo"');
  });

  test("boolean", () => {
    const val = new Value("boolean", false);
    expect(val.toString()).toBe("false");
  });
});
