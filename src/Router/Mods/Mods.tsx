import { useState } from "react";
import { Link, Outlet, Route, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useQuery, UseQueryResult } from "react-query";
import { Mod } from "~/types";
import Button from "~/ui/Button";
import Checkbox from "~/ui/Checkbox";
import Dialog from "~/ui/Dialog";
import { DragDrop } from "~/ui/DragDrop";
import Table from "~/ui/Table";
import { invoke } from "~/utils";
import { gamesRoute } from "../Games";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const modsRoute = new Route({
  getParentRoute: () => gamesRoute,
  path: "$gameId/mods",
  component: Mods,
});

async function fetchMods(gameId: string): Promise<Mod[]> {
  const response = await invoke<Mod[]>("find_all_mods_for_game", {
    gameId: parseInt(gameId, 10),
  });

  if (typeof response === "string") {
    throw new Error(response);
  }
  return response;
}

function useFetchMods(gameId: string): UseQueryResult<Mod[], unknown> {
  return useQuery(
    ["find_all_mods_for_game", gameId],
    async () => await fetchMods(gameId)
  );
}

function AddMods(): JSX.Element {
  const { gameId } = useParams({ from: gamesRoute.id });

  const handleFilesPicked = async (paths: string[]): Promise<void> => {
    if (gameId == null) return;
    void (await invoke("add_mods", {
      gameId: parseInt(gameId, 10),
      paths,
    }));
  };

  return (
    <>
      <DragDrop
        onDrop={async (paths) => {
          if (gameId == null) return;
          void (await invoke("add_mods", {
            gameId: parseInt(gameId, 10),
            paths,
          }));
        }}
        onFilesPicked={handleFilesPicked}
        className="bg-gray-100 h-32"
      />
    </>
  );
}

function Mods(): JSX.Element {
  const { gameId } = useParams({ from: modsRoute.id });
  const { data, isLoading } = useFetchMods(gameId);

  const toggleMod = async (modId: number): Promise<void> => {
    void (await invoke("toggle_mod", { modId }));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Mods</h1>

      <AddMods />

      <div>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Name</Table.Header>
              <Table.Header className="w-1/3 overflow-ellipsis">
                Description
              </Table.Header>
              <Table.Header>Author</Table.Header>
              <Table.Header>Version</Table.Header>
              <Table.Header>Enabled</Table.Header>
              <th />
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {data?.map((mod) => (
              <Table.Row key={mod.id}>
                <Table.Cell>
                  <Link
                    to={`/$gameId/mods/$modId`}
                    params={{ gameId, modId: String(mod.id) }}
                  >
                    {mod.name}
                  </Link>
                </Table.Cell>
                <Table.Cell className="overflow-ellipsis">
                  {mod.description}
                </Table.Cell>
                <Table.Cell>{mod.author}</Table.Cell>
                <Table.Cell>{mod.version}</Table.Cell>
                <Table.Cell>
                  <Checkbox
                    checked={mod.enabled}
                    onChange={() => {
                      void toggleMod(mod.id);
                    }}
                  />
                </Table.Cell>
                <Table.Cell>
                  <FetchModDetails modId={String(mod.id)} />
                  <Button
                    intent="destructive"
                    onClick={() => {
                      void invoke("delete_mod", { modId: mod.id });
                    }}
                  >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Outlet />
      </div>
    </div>
  );
}

const fetchModDetailsSchema = z.object({
  modId: z.string(),
});

function FetchModDetails({ modId }: { modId: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fetchModDetailsSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    const response = await invoke("download_mod_details", {
      modId: Number(modId),
      nexusModId: Number(data.modId),
    });
    console.log({ response });
    setOpen(false);
  }, console.log);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Dialog.Title>Fetch Mod Details</Dialog.Title>
        <div>
          <form>
            <label htmlFor="modId">Nexus Mod ID</label>
            <input {...register("modId")} />
            {errors.modId != null &&
              typeof errors.modId.message === "string" && (
                <p>{errors.modId.message}</p>
              )}
            <div className="flex flex-1 flex-row justify-between px-4">
              <Button
                intent="secondary"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={onSubmit}>
                Fetch
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Fetch Mod Details
      </Button>
    </>
  );
}
