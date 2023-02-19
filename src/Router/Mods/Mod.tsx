import { Route, useNavigate, useParams } from "@tanstack/react-router";
import { UseQueryResult } from "react-query";
import { modsRoute } from "./Mods";
import { Mod as ModType } from "~/types";
import { useInvokeMutation, useInvokeQuery } from "~/utils";
import Image from "~/ui/Image";
import Editor from "~/ui/Editor";
import { useState } from "react";
import HTMLRender from "~/ui/HTMLRenderer";
import { TbTrash } from "react-icons/tb";
import Dialog from "~/ui/Dialog";
import Button from "~/ui/Button";
import FetchModDetails from "~/FetchModDetails";

export const modRoute = new Route({
  getParentRoute: () => modsRoute,
  path: "$modId",
  component: Mod,
});

function useFetchMod(modId: number): UseQueryResult<ModType, unknown> {
  return useInvokeQuery("find_mod", { modId });
}

function Mod(): JSX.Element {
  const { modId, gameId } = useParams({ from: modRoute.id });
  const { data } = useFetchMod(parseInt(modId, 10));
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [note, setNote] = useState(data?.note ?? "");
  const updateNote = useInvokeMutation("update_mod_note");
  const deleteMod = useInvokeMutation("delete_mod", {
    onSuccess: async () => {
      await navigate({
        to: `/$gameId/mods`,
        params: { gameId },
        replace: true,
      });
    },
  });
  return (
    <>
      <h1>{data?.name}</h1>
      <div>
        <Dialog.Warning
          description="Are you sure you want to delete this mod?"
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
          }}
          destructiveAction={() => {
            deleteMod.mutate({ modId: parseInt(modId, 10) });
          }}
        >
          <Button
            intent="destructive"
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <TbTrash />
          </Button>
        </Dialog.Warning>
        <FetchModDetails modId={modId} />
      </div>
      {data?.pictureUrl != null ? (
        <Image className="aspect-auto w-[50%]" src={data?.pictureUrl} />
      ) : null}
      <div className="my-4">
        <Editor
          value={note}
          onChange={(value) => {
            setNote(value);
            updateNote.mutate({ id: parseInt(modId, 10), note: value });
          }}
        />
      </div>
      <h2>Description</h2>
      <div className="prose">
        {data?.description != null ? (
          <HTMLRender value={data?.description} />
        ) : null}
      </div>
    </>
  );
}
