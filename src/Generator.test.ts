import { Generator } from "./Generator.js";

test("one type", () => {
  const gen = new Generator();
  const Person = gen.type({
    name: "Person",
    attributes: [{ type: "string", name: "name" }],
  });
  Person.create({ itemName: "John", attributes: { name: "John" } });
  Person.create({ itemName: "Jill", attributes: { name: "Jill" } });

  expect(gen.generate()).toMatchInlineSnapshot(`
    "LIST People = John, Jill

    VAR John_name = "John"
    VAR Jill_name = "Jill"

    === function database(op, object, value)
    { object:
    - John: ~ return define_person(op, value, John_name)
    - Jill: ~ return define_person(op, value, Jill_name)
    }

    === function define_person(op, value, ref name)
    { op:
    - "get_name": ~ return name
    - "set_name": ~ name = value
    }
    "
  `);
});

test("two types", () => {
  const gen = new Generator();

  const Person = gen.type({
    name: "Person",
    attributes: [{ type: "string", name: "name" }],
  });
  Person.create({ itemName: "John", attributes: { name: "John" } });
  Person.create({ itemName: "Jill", attributes: { name: "Jill" } });

  const Sequence = gen.type({
    name: "Sequence",
    attributes: [
      { type: "string", name: "name", constant: true },
      { type: "knot", name: "knot" },
    ],
  });
  Sequence.create({
    itemName: "S1",
    attributes: {
      name: "S1",
      knot: "s1_knot",
    },
  });
  Sequence.create({
    itemName: "S2",
    attributes: {
      name: "S2",
      knot: "s2_knot",
    },
  });

  expect(gen.generate()).toMatchInlineSnapshot(`
      "LIST People = John, Jill
      LIST Sequences = S1, S2

      VAR John_name = "John"
      VAR Jill_name = "Jill"
      VAR S1_knot = -> s1_knot
      VAR S2_knot = -> s2_knot

      === function database(op, object, value)
      { object:
      - John: ~ return define_person(op, value, John_name)
      - Jill: ~ return define_person(op, value, Jill_name)
      - S1: ~ return define_sequence(op, value, "S1", S1_knot)
      - S2: ~ return define_sequence(op, value, "S2", S2_knot)
      }

      === function define_person(op, value, ref name)
      { op:
      - "get_name": ~ return name
      - "set_name": ~ name = value
      }

      === function define_sequence(op, value, name, ref knot)
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

  const Person = gen.type({ name: "Person" });
  const John = Person.create({ itemName: "John" });
  Person.create({ itemName: "Jill" });

  const Workplace = gen.type({ name: "Workplace" });
  const Lumen = Workplace.create({ itemName: "Lumen" });
  Workplace.create({ itemName: "Dunder_Mifflin" });

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
