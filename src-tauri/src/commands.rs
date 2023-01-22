use prisma::{game, game_mod};

use crate::prisma;

#[tauri::command]
pub async fn create_update_game(
    id: Option<i32>,
    name: String,
    game_mod_folder_path: String,
) -> game::Data {
    let client = prisma::new_client().await.unwrap();

    if let Some(id) = id {
        let game = client
            .game()
            .update(
                game::id::equals(id),
                vec![
                    game::name::set(name),
                    game::game_mod_folder_path::set(game_mod_folder_path),
                ],
            )
            .exec()
            .await
            .unwrap();

        game
    } else {
        let game = client
            .game()
            .create(name, game_mod_folder_path, vec![])
            .exec()
            .await
            .unwrap();
        game
    }
}

#[tauri::command]
pub async fn find_all_games() -> Vec<game::Data> {
    let client = prisma::new_client().await.unwrap();

    let game = client.game().find_many(vec![]).exec().await.unwrap();

    game
}

#[tauri::command]
pub async fn delete_game(game_id: i32) -> game::Data {
    let client = prisma::new_client().await.unwrap();

    let game = client
        .game()
        .delete(game::id::equals(game_id))
        .exec()
        .await
        .unwrap();

    game
}

#[tauri::command]
pub async fn find_all_mods_for_game(game_id: i32) -> Vec<game_mod::Data> {
    let client = prisma::new_client().await.unwrap();

    let mods = client
        .game_mod()
        .find_many(vec![game_mod::game::is(vec![game::id::equals(game_id)])])
        .exec()
        .await
        .unwrap();

    mods
}
