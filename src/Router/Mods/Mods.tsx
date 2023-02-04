import { Route, useParams } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api";
import { useQuery, UseQueryResult } from "react-query";
import { Mod } from "~/types";
import Button from "~/ui/Button";
import { DragDrop } from "~/ui/DragDrop";
import Table from "~/ui/Table";
import { gamesRoute } from "../Games";

export const modRoute = new Route({
  getParentRoute: () => gamesRoute,
  path: "/$gameId/mods",
  component: Mods,
});

async function fetchMods(gameId: string): Promise<Mod[]> {
  return await invoke<Mod[]>("find_all_mods_for_game", {
    gameId: parseInt(gameId, 10),
  });
}

function useFetchMods(gameId: string): UseQueryResult<Mod[], unknown> {
  return useQuery(["find_all_mods_for_game", gameId], () => fetchMods(gameId));
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
  const { gameId } = useParams({ from: gamesRoute.id });
  const { data, isLoading } = useFetchMods(gameId);

  const fetchModDetails = async (modId: number): Promise<void> => {
    const response = await invoke("download_mod_details", {
      modId,
    });

    console.log({ response });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Mods</h1>

      <AddMods />

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header>Name</Table.Header>
            <Table.Header>Description</Table.Header>
            <th />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data?.map((mod) => (
            <Table.Row key={mod.id}>
              <Table.Cell>{mod.name}</Table.Cell>
              <Table.Cell>{mod.description}</Table.Cell>
              <Table.Cell>
                <Button
                  onClick={() => {
                    void fetchModDetails(mod.id);
                  }}
                >
                  Fetch Details
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
