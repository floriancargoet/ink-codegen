import { Block } from "./Block.js";
import { RawCode } from "./RawCode.js";
import { Reference } from "./Reference.js";
import { SwitchStatement } from "./SwitchStatement.js";
import { Value } from "./Value.js";

describe("SwitchStatement", () => {
  test("ref case", () => {
    const sw = new SwitchStatement(new Reference({ name: "thing" }));
    sw.addCase(new Reference({ name: "zork" }), new Block(new RawCode("some code")));
    expect(sw.toString()).toMatchInlineSnapshot(`
        "{ thing:
        - zork: some code
        }
        "
      `);
  });

  test("value case", () => {
    const sw = new SwitchStatement(new Reference({ name: "thing" }));
    sw.addCase(new Value("string", "zork"), new Block(new RawCode("some code")));
    sw.addCase(new Value("integer", 3), new Block(new RawCode("some more code")));
    expect(sw.toString()).toMatchInlineSnapshot(`
        "{ thing:
        - "zork": some code
        - 3: some more code
        }
        "
      `);
  });

  test("else case", () => {
    const sw = new SwitchStatement(new Reference({ name: "thing" }));
    sw.addCase(new Value("string", "zork"), new Block(new RawCode("some code")));
    sw.addElse(new Block(new RawCode("some other code")));
    expect(sw.toString()).toMatchInlineSnapshot(`
        "{ thing:
        - "zork": some code
        - else: some other code
        }
        "
      `);
  });
});
