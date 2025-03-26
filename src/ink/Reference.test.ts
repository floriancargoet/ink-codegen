import { Reference } from "./Reference.js";

describe("Reference", () => {
  test("name only", () => {
    const ref = new Reference({ name: "foo" });
    expect(ref.toString()).toBe("foo");
  });

  test("divert", () => {
    const ref = new Reference({ name: "foo", divert: true });
    expect(ref.toString()).toBe("-> foo");
  });

  test("divert explicitly false", () => {
    const ref = new Reference({ name: "foo", divert: false });
    expect(ref.toString()).toBe("foo");
  });
});
