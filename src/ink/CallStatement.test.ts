import { ArgumentList } from "./ArgumentList.js";
import { CallStatement } from "./CallStatement.js";
import { Reference } from "./Reference.js";
import { Value } from "./Value.js";

describe("CallStatement", () => {
  test("no args", () => {
    const call = new CallStatement({ callable: { name: "foo" } });
    expect(call.toString()).toBe("foo()");
  });

  test("empty args", () => {
    const call = new CallStatement({ callable: { name: "foo" }, args: new ArgumentList([]) });
    expect(call.toString()).toBe("foo()");
  });

  test("some args", () => {
    const call = new CallStatement({
      callable: { name: "foo" },
      args: new ArgumentList([
        new Value("integer", 5),
        new Reference({ name: "bar", divert: true }),
      ]),
    });
    expect(call.toString()).toBe("foo(5, -> bar)");
  });
});
