import { Route, useParams } from "@tanstack/react-router";
import { useQuery, UseQueryResult } from "react-query";
import { modsRoute } from "./Mods";
import { Mod as ModType } from "~/types";
import { invoke } from "~/utils";

export const modRoute = new Route({
  getParentRoute: () => modsRoute,
  path: "$modId",
  component: Mod,
});

async function fetchMod(modId: string): Promise<ModType> {
  const response = await invoke<ModType>("find_mod", {
    modId: parseInt(modId, 10),
  });

  if (typeof response === "string") {
    throw new Error(response);
  }
  return response;
}

function useFetchMod(modId: string): UseQueryResult<ModType, unknown> {
  return useQuery(["find_mod", modId], async () => await fetchMod(modId));
}

function Mod(): JSX.Element {
  const { modId } = useParams({ from: modRoute.id });
  const { data } = useFetchMod(modId);
  return (
    <div>
      <h1>{data?.name}</h1>
      <div>{data?.description}</div>
      <img src={data?.pictureUrl} />
    </div>
  );
}