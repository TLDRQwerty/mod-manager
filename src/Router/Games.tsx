import { useState } from "react";
import * as z from "zod";
import { Link, Route } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, UseQueryResult } from "react-query";
import { rootRoute } from "./__root";
import { Game } from "~/types";
import Button from "~/ui/Button";
import Dialog from "~/ui/Dialog";
import Input from "~/ui/Input";
import Table from "~/ui/Table";
import { invoke, useInvokeMutation, useInvokeQuery } from "~/utils";
import Field from "~/ui/Field";
import Form from "~/ui/Form";

export const gamesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Games,
});

function useFetchGames(): UseQueryResult<Game[], unknown> {
  return useInvokeQuery<Game[]>("find_all_games");
}

const addGameSchema = z.object({
  name: z.string().min(1),
  gameModFolderPath: z.string().min(1),
  nexusGameIdentifier: z.string().optional(),
});

function Games(): JSX.Element {
  const { data, isLoading } = useFetchGames();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(addGameSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await invoke("create_update_game", { ...data, id: gameId });
    reset();
    setDialogOpen(false);
  });

  const deleteMutation = useInvokeMutation("delete_game");

  const handleEdit = ({
    id,
    name,
    gameModFolderPath,
    nexusGameIdentifier,
  }: Game): void => {
    reset();
    setGameId(id);
    setValue("name", name);
    setValue("gameModFolderPath", gameModFolderPath);
    setValue("nexusGameIdentifier", nexusGameIdentifier);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Games List</h1>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        Add Game
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <Dialog.Title>Add Game</Dialog.Title>
        <Dialog.Description>
          Add a new game to be managed by the mod manager.
        </Dialog.Description>
        <Form onSubmit={onSubmit}>
          <Field label="Name" id="name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field
            id="gameModFolderPath"
            label="Mod Path"
            error={errors.gameModFolderPath?.message}
          >
            <Input {...register("gameModFolderPath")} />
          </Field>
          <Field
            id="nexusGameIdentifier"
            label="Nexus Game ID"
            error={errors.gameModFolderPath?.message}
          >
            <Input {...register("nexusGameIdentifier")} />
          </Field>
          <div className="flex flex-1 justify-between pt-4">
            <Button
              intent="secondary"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {gameId != null ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Dialog>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header>Name</Table.Header>
            <Table.Header>Mods Path</Table.Header>
            <div />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data?.map((game) => (
            <Table.Row key={game.id}>
              <Table.Cell>
                <Link to={`/$gameId/mods`} params={{ gameId: String(game.id) }}>
                  {game.name}
                </Link>
              </Table.Cell>
              <Table.Cell>{game.gameModFolderPath}</Table.Cell>
              <Table.Cell>
                <Dialog.Warning
                  open={deleteDialogOpen}
                  description="This will delete the game and disable all the enabled mods"
                  destructiveAction={() => {
                    deleteMutation.mutate({ gameId: game.id });
                  }}
                  onClose={() => {
                    setDeleteDialogOpen(false);
                  }}
                >
                  <Button
                    onClick={() => {
                      setDeleteDialogOpen(true);
                    }}
                    intent="destructive"
                  >
                    Delete
                  </Button>
                </Dialog.Warning>
                <Button
                  onClick={() => {
                    handleEdit({ ...game });
                  }}
                >
                  Edit
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
