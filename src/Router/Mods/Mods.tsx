import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  Route,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useQuery, UseQueryResult } from "react-query";
import { Game, Mod } from "~/types";
import Button from "~/ui/Button";
import Checkbox from "~/ui/Checkbox";
import Dialog from "~/ui/Dialog";
import { DragDrop } from "~/ui/DragDrop";
import Table from "~/ui/Table";
import { invoke, useInvokeMutation } from "~/utils";
import { gamesRoute } from "../Games";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { modRoute } from "./Mod";
import Switch from "~/ui/Switch";
import clsx from "clsx";

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

async function fetchGame(gameId: string): Promise<Game> {
  const response = await invoke<Game>("find_game", {
    gameId: parseInt(gameId, 10),
  });

  if (typeof response === "string") {
    throw new Error(response);
  }

  return response;
}

function useFindGame(gameId: string): UseQueryResult<Game, unknown> {
  return useQuery(["find_game", gameId], async () => await fetchGame(gameId));
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
    <DragDrop
      onDrop={async (paths) => {
        if (gameId == null) return;
        void (await invoke("add_mods", {
          gameId: parseInt(gameId, 10),
          paths,
        }));
      }}
      onFilesPicked={handleFilesPicked}
      className="bg-gray-100 my-8"
    />
  );
}

function Mods(): JSX.Element {
  const { modId, gameId } = useParams({ from: modRoute.id });
  const { data } = useFetchMods(gameId);
  const { data: game } = useFindGame(gameId);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleMod = useInvokeMutation("toggle_mod");
  return (
    <div>
      <h1>{game.name} Mods</h1>

      <AddMods />

      <div className={modId != null ? "grid grid-cols-2" : undefined}>
        <Table className="w-full h-full overflow-y">
          <Table.Head>
            <Table.Row>
              <Table.Header>Name</Table.Header>
              <Table.Header
                className={`w-1/3 overflow-ellipsis ${modId != null ? "hidden" : "visible"
                  }`}
              >
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
              <Table.Row
                key={mod.id}
                className={clsx({
                  "bg-orange-500/50": selected.includes(mod.id),
                })}
                onClick={(e) => {
                  if (e.shiftKey || e.ctrlKey) {
                    setSelected((prev) => {
                      if (prev.includes(mod.id)) {
                        return prev.filter((id) => id !== mod.id);
                      }
                      return [...prev, mod.id];
                    });
                  }
                }}
              >
                <Table.Cell>
                  <Link
                    to={`/$gameId/mods/$modId`}
                    params={{ gameId, modId: String(mod.id) }}
                  >
                    {mod.name}
                  </Link>
                </Table.Cell>
                <Table.Cell
                  className={`overflow-ellipsis ${modId != null ? "hidden" : "visible"
                    }`}
                >
                  {mod.description}
                </Table.Cell>
                <Table.Cell>{mod.author}</Table.Cell>
                <Table.Cell>{mod.version}</Table.Cell>
                <Table.Cell>
                  <Switch
                    checked={mod.enabled}
                    onChange={() => {
                      toggleMod.mutate({ modId: mod.id });
                    }}
                    label="Enable Mod"
                  ></Switch>
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
        <div>
          <Outlet />
        </div>
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
    await invoke("download_mod_details", {
      modId: Number(modId),
      nexusModId: Number(data.modId),
    });
    setOpen(false);
  });

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
