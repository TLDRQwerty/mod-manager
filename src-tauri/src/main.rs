#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod prisma;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::create_update_game,
            commands::find_all_games,
            commands::find_all_mods_for_game,
            commands::delete_game,
            commands::add_mods,
            commands::delete_mod,
            commands::enable_mod,
            commands::disable_mod,
            commands::download_mod_details,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
