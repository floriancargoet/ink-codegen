import { ensureOneNewLineAtEnd } from "./utils.js";

describe("utils", () => {
  describe("ensureOneNewLineAtEnd", () => {
    test("empty => \\n", () => {
      expect(ensureOneNewLineAtEnd("")).toBe("\n");
    });
    test("\\n => \\n", () => {
      expect(ensureOneNewLineAtEnd("\n")).toBe("\n");
    });
    test("foo => foo\\n", () => {
      expect(ensureOneNewLineAtEnd("foo")).toBe("foo\n");
    });
  });
});
