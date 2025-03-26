import { Base } from "./ink/Base.js";

export function ensureOneNewLineAtEnd(str: string) {
  if (str.length === 0) return "\n";
  if (str[str.length - 1] !== "\n") return str + "\n";
  return str;
}

export type Stringifiable = null | undefined | string | Base | Array<Stringifiable>;

export function stringify(value: Stringifiable) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v: Stringifiable) => v?.toString() ?? "").join("");
  return value.toString();
}
