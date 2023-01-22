import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@headlessui/react";
import { Link } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/tauri";
import { useQuery, UseQueryResult } from "react-query";
import { Game } from "../types";
import { modRoute } from "./Router";
import { useForm } from "react-hook-form";

export async function findAllGames(): Promise<Game[]> {
  return await invoke("find_all_games");
}

function useFindAllGames(): UseQueryResult<Game[], unknown> {
  return useQuery<Game[], unknown>(["find-all-games"], findAllGames);
}

function GameRow({ game }: { game: Game }): JSX.Element {
  const deleteGame = async (): Promise<void> => {
    await invoke("delete_game", { gameId: game.id });
  };

  return (
    <tr className="text-gray-700">
      <td className="border px-4 py-2">{game.id}</td>
      <td className="border px-4 py-2">{game.name}</td>
      <td className="border px-4 py-2">{game.gameModFolderPath}</td>
      <td className="border px-4 py-2">
        <div className="flex space-x-2">
          <Link to={modRoute.id} params={{ gameId: String(game.id) }}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View Mods
            </button>
          </Link>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={deleteGame}
          >
            Delete
          </button>
          <CreateUpdateGameConfig game={game} />
        </div>
      </td>
    </tr>
  );
}

const createGameSchema = z.object({
  name: z.string(),
  gameModFolderPath: z.string(),
});

function CreateUpdateGameConfig({ game }: { game?: Game }): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: game,
    resolver: zodResolver(createGameSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await invoke("create_update_game", { ...data, id: game?.id });
  });

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {game?.id != null ? "Update" : "Create"} Game Config
      </button>
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        className="relative z-50 inset-0"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Create new Game Config
            </Dialog.Title>
            <Dialog.Description>
              This will be new game managed by the mod manager.
            </Dialog.Description>

            <form>
              <div className="my-4">
                <label htmlFor="name" className="font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.name?.message != null && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}

                <label
                  htmlFor="gameModFolderPath"
                  className="font-medium text-gray-700"
                >
                  Game Mod Folder Path
                </label>
                <input
                  type="text"
                  {...register("gameModFolderPath")}
                  className="border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {errors.gameModFolderPath?.message != null && (
                  <p className="text-red-500">
                    {errors.gameModFolderPath.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    void onSubmit();
                    setIsOpen(false);
                  }}
                >
                  {game?.id != null ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

export default function Home(): JSX.Element {
  const { data } = useFindAllGames();

  return (
    <div>
      <h1>Games</h1>
      <CreateUpdateGameConfig />
      <div>
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Game Mod Folder Path</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.map((game) => (
              <GameRow key={game.id} game={game} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
