#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::thread;

mod commands;
mod prisma;

fn main() {
    thread::spawn(|| {
        println!("Starting server");
    });
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::create_update_game,
            commands::find_all_games,
            commands::find_all_mods_for_game,
            commands::find_game,
            commands::find_mod,
            commands::delete_game,
            commands::add_mods,
            commands::delete_mod,
            commands::enable_mod,
            commands::disable_mod,
            commands::download_mod_details,
            commands::toggle_mod,
            commands::update_mod_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
