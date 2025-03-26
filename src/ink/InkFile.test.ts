import { t } from "./Factory.js";
import { InkFile } from "./InkFile.js";

test("ink file", () => {
  const tree = new InkFile();
  tree.include("utils.ink");
  tree.function("database", ["op", "value"], [t.code("-> DONE")]);
  const definePerson = tree.function(
    "get_set_person",
    ["op", "value", { name: "name", ref: true }],
    [t.code("-> DONE")],
  );
  tree.implicitKnot.add(t.code(`~ ${t.call(definePerson, ["x", "y", "z"]).toString()}\n`));
  tree.knot("start", undefined, [t.code("Hello")]);

  expect(tree.toString()).toMatchInlineSnapshot(`
    "INCLUDE utils.ink

    ~ get_set_person(x, y, z)

    === function database(op, value)
    -> DONE

    === function get_set_person(op, value, ref name)
    -> DONE

    === start
    Hello
    "
  `);
});
