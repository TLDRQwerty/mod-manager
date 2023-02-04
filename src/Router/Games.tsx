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
import { invoke } from "~/utils";

export const gamesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Games,
});

async function fetchGames(): Promise<Game[]> {
  const response = await invoke<Game[]>("find_all_games", {});
  if (typeof response === "string") {
    throw new Error(response);
  }
  return response;
}

function useFetchGames(): UseQueryResult<Game[], unknown> {
  return useQuery(["find_all_games"], fetchGames);
}

const addGameSchema = z.object({
  name: z.string().min(1),
  modFolderPath: z.string().min(1),
  nexusGameIdentifier: z.string().optional(),
});

function Games(): JSX.Element {
  const { data, isLoading } = useFetchGames();

  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleDelete = async (gameId: number): Promise<void> => {
    await invoke("delete_game", { gameId });
  };

  const handleEdit = ({
    id,
    name,
    gameModFolderPath,
    nexusGameIdentifier,
  }: Game): void => {
    setGameId(id);
    setValue("name", name);
    setValue("modFolderPath", gameModFolderPath);
    setValue("nexusGameIdentifier", nexusGameIdentifier);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h3>Welcome Home!</h3>
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
        <p>{String(gameId)}</p>
        <label htmlFor="name">Name</label>
        <Input {...register("name")} />
        {errors.name != null && typeof errors.name.message === "string" && (
          <p>{errors.name.message}</p>
        )}
        <label htmlFor="modFolderPath">Mods Path</label>
        <Input {...register("modFolderPath")} />
        {errors.modFolderPath != null &&
          typeof errors.modFolderPath.message === "string" && (
            <p>{errors.modFolderPath.message}</p>
          )}
        <label htmlFor="nexusGameIdentifier">Nexus Game ID</label>
        <Input {...register("nexusGameIdentifier")} />
        {errors.modFolderPath != null &&
          typeof errors.modFolderPath.message === "string" && (
            <p>{errors.modFolderPath.message}</p>
          )}
        <div className="flex flex-1 justify-between">
          <Button
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {gameId != null ? "Update" : "Create"}
          </Button>
        </div>
      </Dialog>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header>Name</Table.Header>
            <Table.Header>Mods Path</Table.Header>
            <th />
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
                <Button
                  onClick={() => {
                    void handleDelete(game.id);
                  }}
                >
                  Delete
                </Button>
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
