import { Stringifiable, stringify } from "./utils.js";

function unindent(str: string) {
  const lines = str.split("\n");
  if (lines.length < 1) return str;
  // first line is \n, then we read the indent of lines[1]
  const m = lines[1]?.match(/^( *)/);
  const indent = m ? m[1]?.length : 0;
  if (indent === 0) return str;
  const indentRe = new RegExp(`^ {${indent}}`);
  const keptLines = lines.slice(1, -1); // FIXME: check removed lines really are empty

  return (
    keptLines
      .map((line) => line.replace(indentRe, ""))
      .filter((line, i, all) => {
        // Compact multiple empty lines
        return !(line === "" && all[i + 1] === "");
      })
      .join("\n") + "\n"
  );
}

export function u(strings: TemplateStringsArray, ...values: Array<Stringifiable>) {
  const text = unindent(strings.map((s, i) => s + stringify(values[i])).join(""));
  if (text.trim() === "") return "";
  return text;
}
