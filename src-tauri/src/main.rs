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
            commands::delete_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
