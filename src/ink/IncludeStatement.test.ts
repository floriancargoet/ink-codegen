import { IncludeStatement } from "./IncludeStatement.js";

describe("IncludeStatement", () => {
  test("include", () => {
    const foo = new IncludeStatement("path/to/file.ink");
    expect(foo.toString()).toBe("INCLUDE path/to/file.ink\n");
  });
});
