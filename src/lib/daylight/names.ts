import { exerciseById } from "./exercises";
import { loadCustomNames } from "./store";

export function exerciseLabel(id: string): string {
  return exerciseById(id)?.name ?? loadCustomNames()[id] ?? "Custom exercise";
}
