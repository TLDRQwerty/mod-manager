import { Route, useParams } from "@tanstack/react-router";
import { UseQueryResult } from "react-query";
import { modsRoute } from "./Mods";
import { Mod as ModType } from "~/types";
import { useInvokeMutation, useInvokeQuery } from "~/utils";
import Image from "~/ui/Image";
import Editor from "~/ui/Editor";
import { useState } from "react";
import HTMLRender from "~/ui/HTMLRenderer";

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
  const [note, setNote] = useState(data?.note ?? "");
  const updateNote = useInvokeMutation("update_mod_note");
  return (
    <>
      <h1>{data?.name}</h1>
      {data?.pictureUrl != null ? (
        <Image className="w-[50%] aspect-auto" src={data?.pictureUrl} />
      ) : null}
      <Editor
        value={note}
        onChange={(value) => {
          setNote(value);
          updateNote.mutate({ id: parseInt(modId, 10), note: value });
        }}
      />
      <h2>Description</h2>
      {data?.description != null ? (
        <HTMLRender value={data?.description} />
      ) : null}
    </>
  );
}
