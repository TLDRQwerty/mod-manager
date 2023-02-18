import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  Route,
  useNavigate,
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
import { invoke, useInvokeMutation, useInvokeQuery } from "~/utils";
import { gamesRoute } from "../Games";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { modRoute } from "./Mod";
import Switch from "~/ui/Switch";
import clsx from "clsx";
import { rootRoute } from "../__root";
import Form from "~/ui/Form";
import Input from "~/ui/Input";
import Field from "~/ui/Field";

export const modsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "$gameId/mods",
  component: Mods,
});

function useFetchMods(gameId: number): UseQueryResult<Mod[], unknown> {
  return useInvokeQuery("find_all_mods_for_game", { gameId });
}

function useFindGame(gameId: number): UseQueryResult<Game, unknown> {
  return useInvokeQuery("find_game", { gameId });
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
  const navigation = useNavigate();
  const { modId, gameId } = useParams({ from: modRoute.id });
  const { data } = useFetchMods(parseInt(gameId, 10));
  const { data: game } = useFindGame(parseInt(gameId, 10));
  const [selected, setSelected] = useState<number[]>([]);
  const deleteMod = useInvokeMutation("delete_mod", {
    onSuccess: async (_, vars) => {
      if (vars?.modId === modId) {
        await navigation({
          to: `/$gameId/mods`,
          params: { gameId },
          replace: true,
        });
      }
    },
  });

  const toggleMod = useInvokeMutation("toggle_mod");
  return (
    <div className="max-h-screen">
      <h1>{game.name} Mods</h1>

      <AddMods />

      <div
        className={clsx(modId != null ? "grid grid-cols-2 gap-4" : undefined)}
      >
        <Table className="h-min">
          <Table.Head>
            <Table.Row>
              <Table.Header>Name</Table.Header>
              <Table.Header
                className={clsx(modId != null ? "hidden" : "visible")}
              >
                Description
              </Table.Header>
              <Table.Header>Author</Table.Header>
              <Table.Header>Version</Table.Header>
              <div />
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
                    activeProps={{
                      className: "font-bold",
                    }}
                  >
                    {mod.name}
                  </Link>
                </Table.Cell>
                <Table.Cell
                  className={clsx(
                    "overflow-hidden whitespace-nowrap overflow-ellipsis",
                    modId != null ? "hidden" : "visible"
                  )}
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
                  <FetchModDetails modId={String(mod.id)} />
                  <Button
                    intent="destructive"
                    onClick={() => {
                      deleteMod.mutate({ modId: mod.id });
                    }}
                  >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <div className="h-min max-h-[60vh] overflow-y-scroll">
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
          <Form onSubmit={onSubmit}>
            <Field
              label="Nexus Mod ID"
              id="modId"
              error={errors.modId?.message}
            >
              <Input {...register("modId")} />
            </Field>
            <div className="pt-4 flex flex-1 flex-row justify-between px-4">
              <Button
                intent="secondary"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Fetch</Button>
            </div>
          </Form>
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
