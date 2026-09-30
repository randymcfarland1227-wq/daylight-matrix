import { createFileRoute } from "@tanstack/react-router";
import { DaylightApp } from "@/components/daylight/App";

export const Route = createFileRoute("/")({ component: DaylightApp });
