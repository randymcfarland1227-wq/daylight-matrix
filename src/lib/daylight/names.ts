import { exerciseById } from "./plan";
import { loadCustomNames } from "./store";

export function exerciseLabel(id: string): string {
  return exerciseById(id)?.name ?? loadCustomNames()[id] ?? "Exercise";
}
