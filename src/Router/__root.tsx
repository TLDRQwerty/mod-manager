import { Link, Outlet, RootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const rootRoute = new RootRoute({
  component: () => (
    <>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div className="p-2">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
});
