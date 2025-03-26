import { Reference } from "./Reference.js";
import { Value } from "./Value.js";
import { VarDeclaration } from "./VarDeclaration.js";

describe("VarDeclaration", () => {
  test("value", () => {
    const foo = new VarDeclaration("foo", new Value("integer", 3));
    expect(foo.toString()).toBe("VAR foo = 3\n");
    const bar = new VarDeclaration("bar", new Value("string", "hello"));
    expect(bar.toString()).toBe('VAR bar = "hello"\n');
    const baz = new VarDeclaration("baz", new Value("boolean", true));
    expect(baz.toString()).toBe("VAR baz = true\n");
  });

  test("reference", () => {
    const foo = new VarDeclaration("foo", new Reference({ name: "bar" }));
    expect(foo.toString()).toBe("VAR foo = bar\n");
    const bar = new VarDeclaration("bar", new Reference({ name: "foo", divert: true }));
    expect(bar.toString()).toBe("VAR bar = -> foo\n");
  });
});
