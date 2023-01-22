import {
  Outlet,
  RouterProvider,
  ReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";
import { queryClient } from "../App";
import Home, { findAllGames } from "./Home";
import Mods from "./Mods";

export const rootRoute = createRouteConfig({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

const homeRoute = rootRoute.createRoute({
  path: "/",
  component: Home,
  loader: async () => {
    queryClient.getQueryData("find-all-games") ??
      (await queryClient.prefetchQuery("find-all-games", findAllGames));
    return {};
  },
});

export const modRoute = rootRoute.createRoute({
  path: "$gameId",
  component: Mods,
});

const routeConfig = rootRoute.addChildren([homeRoute, modRoute]);

const router = new ReactRouter({ routeConfig });

export default function Router(): JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

declare module "@tanstack/react-router" {
  interface RegisterRouter {
    router: typeof router;
  }
}
