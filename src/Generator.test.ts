import { Generator } from "./Generator.js";

test("one type", () => {
  const gen = new Generator();
  const Person = gen.type("Person").attr({ type: "string", name: "name" });
  Person.create("John", { name: "John" });
  Person.create("Jill", { name: "Jill" });

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John, Jill

    VAR John_name = "John"
    VAR Jill_name = "Jill"

    === function database(op, object, value)
    { object:
    - John: ~ return get_set_person(op, value, John_name)
    - Jill: ~ return get_set_person(op, value, Jill_name)
    }

    === function get_set_person(op, value, ref name)
    { op:
    - "get_name": ~ return name
    - "set_name": ~ name = value
    }
    "
  `);
});

test("two types", () => {
  const gen = new Generator();

  const Person = gen.type("Person").attr({ type: "string", name: "name" });
  Person.create("John", { name: "John" });
  Person.create("Jill");

  const Sequence = gen
    .type("Sequence")
    .attr({ type: "string", name: "name", constant: true })
    .attr({ type: "divert", name: "knot" });
  Sequence.create("S1", {
    name: "S1",
    knot: "s1_knot",
  });
  Sequence.create("S2", {
    name: "S2",
    knot: "s2_knot",
  });

  expect(gen.generate()).toMatchInlineSnapshot(`
      "LIST People = John, Jill
      LIST Sequences = S1, S2

      VAR John_name = "John"
      VAR Jill_name = ""
      VAR S1_knot = -> s1_knot
      VAR S2_knot = -> s2_knot

      === function database(op, object, value)
      { object:
      - John: ~ return get_set_person(op, value, John_name)
      - Jill: ~ return get_set_person(op, value, Jill_name)
      - S1: ~ return get_set_sequence(op, value, "S1", S1_knot)
      - S2: ~ return get_set_sequence(op, value, "S2", S2_knot)
      }

      === function get_set_person(op, value, ref name)
      { op:
      - "get_name": ~ return name
      - "set_name": ~ name = value
      }

      === function get_set_sequence(op, value, name, ref knot)
      { op:
      - "get_name": ~ return name
      - "get_knot": ~ return knot
      - "set_knot": ~ knot = value
      }
      "
    `);
});

test("relations", () => {
  const gen = new Generator();

  const Person = gen.type("Person");
  const John = Person.create("John");
  Person.create("Jill");

  const Workplace = gen.type("Workplace");
  const Lumen = Workplace.create("Lumen");
  Workplace.create("Dunder_Mifflin");

  const WorksAt = gen.relation("WorksAt", Person, Workplace);

  WorksAt.relate(John, Lumen);

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John, Jill
    LIST Workplaces = Lumen, Dunder_Mifflin

    LIST Relations = WorksAt

    ~ relate(John, WorksAt, Lumen)

    === function left_right(left, left_list, right_list)
    { left:
      ~ return left_list
    - else:
      ~ return right_list
    }

    === function relationDatabase(relation, left)
    { relation:
    - WorksAt: ~ return left_right(left, Person, Workplace)
    }
    "
  `);
});

test("attribute of type reference", () => {
  const gen = new Generator();

  const Person = gen.type("Person").attr({
    type: "reference",
    name: "workplace",
  });
  Person.create("John", { workplace: "Lumen" });

  const Workplace = gen.type({ name: "Workplace" });
  Workplace.create("Lumen");

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John
    LIST Workplaces = Lumen

    VAR John_workplace = Lumen

    === function database(op, object, value)
    { object:
    - John: ~ return get_set_person(op, value, John_workplace)
    }

    === function get_set_person(op, value, ref workplace)
    { op:
    - "get_workplace": ~ return workplace
    - "set_workplace": ~ workplace = value
    }
    "
  `);
});

test("database helpers", () => {
  const gen = new Generator();

  const Person = gen.type("Person").attr({ type: "string", name: "name" });
  Person.create("John", { name: "John" });
  Person.create("Jill", { name: "Jill" });

  const Workplace = gen.type("Workplace").attr({ type: "string", name: "name" });
  Workplace.create("Lumen");
  Workplace.create("Dunder_Mifflin");

  gen.addDatabaseHelper("get", "name");
  gen.addDatabaseHelper("set", "name", "foobar");

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John, Jill
    LIST Workplaces = Lumen, Dunder_Mifflin

    VAR John_name = "John"
    VAR Jill_name = "Jill"
    VAR Lumen_name = ""
    VAR Dunder_Mifflin_name = ""

    === function database(op, object, value)
    { object:
    - John: ~ return get_set_person(op, value, John_name)
    - Jill: ~ return get_set_person(op, value, Jill_name)
    - Lumen: ~ return get_set_workplace(op, value, Lumen_name)
    - Dunder_Mifflin: ~ return get_set_workplace(op, value, Dunder_Mifflin_name)
    }

    === function get_set_person(op, value, ref name)
    { op:
    - "get_name": ~ return name
    - "set_name": ~ name = value
    }

    === function get_set_workplace(op, value, ref name)
    { op:
    - "get_name": ~ return name
    - "set_name": ~ name = value
    }

    === function get_name(object)
    ~ return database("get_name", object, "")

    === function foobar(object, name)
    ~ return database("set_name", object, name)
    "
  `);
});

test("double generate", () => {
  const gen = new Generator();
  const Person = gen.type("Person");
  Person.create("John");

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John
    "
  `);
  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John
    "
  `);
});
