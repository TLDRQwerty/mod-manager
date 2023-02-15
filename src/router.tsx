import { ReactRouter } from "@tanstack/react-router";
import { gamesRoute } from "./Router/Games";
import { modRoute } from "./Router/Mods/Mod";
import { modsRoute } from "./Router/Mods/Mods";
import { rootRoute } from "./Router/__root";

const routeTree = rootRoute.addChildren([
  gamesRoute,
  modsRoute.addChildren([modRoute]),
]);

export const router = new ReactRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
