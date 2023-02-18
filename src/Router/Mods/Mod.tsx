import { Route, useParams } from "@tanstack/react-router";
import { UseQueryResult } from "react-query";
import { modsRoute } from "./Mods";
import { Mod as ModType } from "~/types";
import { useInvokeQuery } from "~/utils";
import Image from "~/ui/Image";

export const modRoute = new Route({
  getParentRoute: () => modsRoute,
  path: "$modId",
  component: Mod,
});

function useFetchMod(modId: number): UseQueryResult<ModType, unknown> {
  return useInvokeQuery("find_mod", { modId });
}

function Mod(): JSX.Element {
  const { modId } = useParams({ from: modRoute.id });
  const { data } = useFetchMod(parseInt(modId, 10));
  return (
    <>
      <h1>{data?.name}</h1>
      {data?.pictureUrl != null ? (
        <Image className="w-[50%] aspect-auto" src={data?.pictureUrl} />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: data?.description ?? "" }} />
    </>
  );
}
