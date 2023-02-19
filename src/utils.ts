import { invoke as baseInvoke } from "@tauri-apps/api";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "react-query";

const COMMANDS = {
  create_update_game: "create_update_game",
  find_all_games: "find_all_games",
  find_all_mods_for_game: "find_all_mods_for_game",
  delete_game: "delete_game",
  add_mods: "add_mods",
  delete_mod: "delete_mod",
  enable_mod: "enable_mod",
  disable_mod: "disable_mod",
  download_mod_details: "download_mod_details",
  toggle_mod: "toggle_mod",
  find_mod: "find_mod",
  find_game: "find_game",
  update_mod_note: "update_mod_note",
  update_game_note: "update_game_note",
} as const;

type COMMANDS = (typeof COMMANDS)[keyof typeof COMMANDS];

export function useInvokeQuery<T>(
  command: COMMANDS,
  args: Record<string, unknown> = {}
): UseQueryResult<T> {
  return useQuery<T>([command, ...Object.values(args)], async () => {
    const result = await invoke<T | string>(command, args);
    if (typeof result === "string") {
      throw new Error(result);
    }
    return result;
  });
}

export function useInvokeMutation<T, A = Record<string, unknown>>(
  command: COMMANDS,
  options?: UseMutationOptions<T | string>
): UseMutationResult<T, unknown, A> {
  return useMutation<T, unknown, A>(async (args: A) => {
    return await invoke<T>(command, args);
  }, options);
}

export async function invoke<T>(
  command: COMMANDS,
  args: Record<string, unknown>
): Promise<T | string> {
  return await baseInvoke<T | string>(command, args);
}
