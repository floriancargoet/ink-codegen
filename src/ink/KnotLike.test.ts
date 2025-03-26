import { Block } from "./Block.js";
import { KnotLike } from "./KnotLike.js";
import { Parameter, ParameterList } from "./ParameterList.js";
import { RawCode } from "./RawCode.js";

describe("KnotLike", () => {
  test("simple knot", () => {
    const knot = new KnotLike({ type: "knot", name: "my_knot" });
    expect(knot.toString()).toMatchInlineSnapshot(`
      "=== my_knot
      "
    `);
  });

  test("simple knot with body", () => {
    const knot = new KnotLike({
      type: "knot",
      name: "my_knot",
      body: new Block(new RawCode("-> DONE")),
    });
    expect(knot.toString()).toMatchInlineSnapshot(`
      "=== my_knot
      -> DONE
      "
    `);
  });

  test("knot with params", () => {
    const knot = new KnotLike({
      type: "knot",
      name: "my_knot",
      parameters: new ParameterList([new Parameter({ name: "foo" })]),
      body: new Block(new RawCode("-> DONE")),
    });
    expect(knot.toString()).toMatchInlineSnapshot(`
      "=== my_knot(foo)
      -> DONE
      "
    `);
  });

  test("unamed knot (implicit knot)", () => {
    const knot = new KnotLike({
      type: "knot",
      name: "",
      parameters: new ParameterList([new Parameter({ name: "foo" })]),
      body: new Block(new RawCode("-> DONE")),
    });
    expect(knot.toString()).toMatchInlineSnapshot(`
        "-> DONE
        "
      `);
  });

  test("add to body", () => {
    const knot = new KnotLike({
      type: "knot",
      name: "my_knot",
      parameters: new ParameterList([new Parameter({ name: "foo" })]),
    });
    knot.add(new RawCode("-> DONE\n"));
    knot.add(new RawCode("-> END"));
    expect(knot.toString()).toMatchInlineSnapshot(`
      "=== my_knot(foo)
      -> DONE
      -> END
      "
    `);
  });

  test("function knot", () => {
    const fn = new KnotLike({
      type: "function",
      name: "my_func",
      parameters: new ParameterList([new Parameter({ name: "foo" })]),
      body: new Block(new RawCode("-> DONE")),
    });
    expect(fn.toString()).toMatchInlineSnapshot(`
      "=== function my_func(foo)
      -> DONE
      "
    `);
  });

  test("stitch", () => {
    const stitch = new KnotLike({
      type: "stitch",
      name: "my_stitch",
      parameters: new ParameterList([new Parameter({ name: "foo" })]),
      body: new Block(new RawCode("-> DONE")),
    });
    expect(stitch.toString()).toMatchInlineSnapshot(`
      "= my_stitch(foo)
      -> DONE
      "
    `);
  });
});
