import { ArgumentList } from "./ArgumentList.js";
import { Reference } from "./Reference.js";
import { Value } from "./Value.js";

describe("ArgumentList", () => {
  test("empty", () => {
    const argList = new ArgumentList([]);
    expect(argList.toString()).toEqual("");
  });

  test("one ref arg", () => {
    const argList = new ArgumentList([new Reference({ name: "test" })]);
    expect(argList.toString()).toEqual("test");
  });

  test("one divert arg", () => {
    const argList = new ArgumentList([new Reference({ name: "test", divert: true })]);
    expect(argList.toString()).toEqual("-> test");
  });

  test("multiple args", () => {
    const argList = new ArgumentList([
      new Reference({ name: "test", divert: true }),
      new Value("boolean", false),
      new Value("string", "foo"),
    ]);
    expect(argList.toString()).toEqual('-> test, false, "foo"');
  });
});
