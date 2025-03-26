import { Parameter, ParameterList } from "./ParameterList.js";

describe("ParameterList", () => {
  test("empty", () => {
    const paramList = new ParameterList([]);
    expect(paramList.toString()).toEqual("");
  });

  test("one ref param", () => {
    const paramList = new ParameterList([new Parameter({ name: "test" })]);
    expect(paramList.toString()).toEqual("test");
  });

  test("one divert param", () => {
    const paramList = new ParameterList([new Parameter({ name: "test", divert: true })]);
    expect(paramList.toString()).toEqual("-> test");
  });

  test("multiple args", () => {
    const paramList = new ParameterList([
      new Parameter({ name: "test", divert: true }),
      new Parameter({ name: "foo" }),
      new Parameter({ name: "bar", ref: true }),
    ]);
    expect(paramList.toString()).toEqual("-> test, foo, ref bar");
  });
});
