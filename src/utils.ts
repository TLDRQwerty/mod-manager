import { invoke as baseInvoke } from "@tauri-apps/api";

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
} as const;

type COMMANDS = (typeof COMMANDS)[keyof typeof COMMANDS];

export async function invoke<T>(
  command: COMMANDS,
  args: Record<string, unknown>
): Promise<T | string> {
  return await baseInvoke<T | string>(command, args);
}
