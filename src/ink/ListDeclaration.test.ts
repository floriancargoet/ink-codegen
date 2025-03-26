import { ListDeclaration } from "./ListDeclaration.js";

describe("ListDeclaration", () => {
  test("empty", () => {
    const list = new ListDeclaration("MyList", []);
    expect(list.toString()).toBe("");
  });

  test("empty 2", () => {
    const list = new ListDeclaration("MyList");
    expect(list.toString()).toBe("");
  });

  test("one item", () => {
    const list = new ListDeclaration("MyList", ["MyItem"]);
    expect(list.toString()).toBe("LIST MyList = MyItem\n");
  });

  test("two items", () => {
    const list = new ListDeclaration("MyList", ["MyItem", "MyThing"]);
    expect(list.toString()).toBe("LIST MyList = MyItem, MyThing\n");
  });

  test("add", () => {
    const list = new ListDeclaration("MyList", ["MyItem"]);
    expect(list.toString()).toBe("LIST MyList = MyItem\n");
    list.addItem("MyThing");
    expect(list.toString()).toBe("LIST MyList = MyItem, MyThing\n");
  });
});
