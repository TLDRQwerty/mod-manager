use std::path::Path;

use bbclash::bbcode_to_html;
use prisma::{game, game_mod};
use prisma_client_rust::{NewClientError, QueryError};
use std::fs::File;
use tauri::{generate_context, State};
use tempfile::Builder;
use tokio::fs::symlink;

use crate::prisma::{self, game_mod::relative_folder_path};

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("QueryError: {0}")]
    QueryError(#[from] QueryError),
    #[error("ReqwestError: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("IoError: {0}")]
    IoError(#[from] std::io::Error),
    #[error("ZipError: {0}")]
    ZipError(#[from] zip::result::ZipError),
    #[error("Utf8Error: {0}")]
    Utf8Error(#[from] std::str::Utf8Error),
    #[error("JsonError: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("TauriError: {0}")]
    TauriError(#[from] tauri::Error),
    #[error("StringError: {0}")]
    StringError(String),
    #[error("StripPrefixError: {0}")]
    StripPrefixError(#[from] std::path::StripPrefixError),
    #[error("NewClientError: {0}")]
    NewClientError(#[from] NewClientError),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string().as_ref())
    }
}

#[tauri::command]
pub async fn create_update_game(
    id: Option<i32>,
    name: String,
    mod_folder_path: String,
    nexus_game_identifier: Option<String>,
) -> Result<game::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    if let Some(id) = id {
        let game = client
            .game()
            .update(
                game::id::equals(id),
                vec![
                    game::name::set(name),
                    game::game_mod_folder_path::set(mod_folder_path),
                    game::nexus_game_identifier::set(nexus_game_identifier),
                ],
            )
            .exec()
            .await?;

        Ok(game)
    } else {
        let game = client
            .game()
            .create(name, mod_folder_path, vec![])
            .exec()
            .await?;
        Ok(game)
    }
}

#[tauri::command]
pub async fn find_all_games() -> Result<Vec<game::Data>, Error> {
    let client = prisma::new_client().await.unwrap();

    let game = client.game().find_many(vec![]).exec().await?;

    Ok(game)
}

#[tauri::command]
pub async fn delete_game(game_id: i32) -> Result<game::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game = client
        .game()
        .find_first(vec![game::id::equals(game_id)])
        .exec()
        .await?;

    let game = match game {
        Some(game) => game,
        None => return Err(Error::StringError("Game not found".to_string())),
    };

    let mods = client
        .game_mod()
        .find_many(vec![game_mod::game::is(vec![game::id::equals(game_id)])])
        .exec()
        .await?;

    for game_mod in mods {
        let relative_folder_path = match game_mod.relative_folder_path {
            Some(p) => p,
            None => {
                return Err(Error::StringError(
                        "Game install path not found".to_string(),
                        ))
            }
        };
        if game_mod.enabled {
            let path = Path::new(&game.game_mod_folder_path).join(&relative_folder_path);

            if path.exists() {
                std::fs::remove_dir_all(&path)?;
            }
        }

        let path = tauri::api::path::app_cache_dir(generate_context!().config());

        let path = match path {
            Some(p) => p,
            None => return Err(Error::StringError("Download path not found".to_string())),
        };

        let relative_archive_path = match game_mod.relative_archive_path {
            Some(p) => p,
            None => {
                return Err(Error::StringError(
                    "Game install path not found".to_string(),
                ))
            }
        };

        let extracted_path = path.join(&relative_folder_path);
        let archive_path = path.join(&relative_archive_path);

        if extracted_path.exists() {
            std::fs::remove_dir_all(&extracted_path)?;
        }

        if archive_path.exists() {
            std::fs::remove_file(&archive_path)?;
        }

        let game_mod = client
            .game_mod()
            .delete(game_mod::id::equals(game_mod.id))
            .exec()
            .await?;
    }

    let game = client
        .game()
        .delete(game::id::equals(game_id))
        .exec()
        .await?;

    Ok(game)
}

#[tauri::command]
pub async fn find_all_mods_for_game(game_id: i32) -> Result<Vec<game_mod::Data>, Error> {
    let client = prisma::new_client().await.unwrap();

    let mods = client
        .game_mod()
        .find_many(vec![game_mod::game::is(vec![game::id::equals(game_id)])])
        .exec()
        .await?;

    Ok(mods)
}

#[tauri::command]
pub async fn add_mods(paths: Vec<String>, game_id: i32) -> Result<Vec<game_mod::Data>, Error> {
    let client = prisma::new_client().await?;

    let mut mods: Vec<game_mod::Data> = vec![];

    let cache_dir = tauri::api::path::app_cache_dir(generate_context!().config()).unwrap();

    if !cache_dir.exists() {
        std::fs::create_dir(&cache_dir)?;
        println!("created cache_dir: {:?}", cache_dir);
    }

    let archive_dir = cache_dir.join("archieve");
    println!("mods_dir: {:?}", archive_dir);

    let mods_dir = cache_dir.join("mods");
    println!("mods_dir: {:?}", mods_dir);

    if !mods_dir.exists() {
        std::fs::create_dir(&mods_dir)?;
        println!("created mods_dir: {:?}", archive_dir);
    }

    if !archive_dir.exists() {
        std::fs::create_dir(&archive_dir)?;
        println!("created archive_dir: {:?}", archive_dir);
    }

    for path in paths {
        let source_file_name = Path::new(&path).file_name().unwrap().to_str().unwrap();
        let archive_file_path = archive_dir.join(source_file_name);

        std::fs::copy(&path, &archive_file_path)?;
        println!("copied file from {:?} to {:?}", path, archive_file_path);

        // unzip file
        let file = File::open(&archive_file_path)?;
        let mut archive = zip::ZipArchive::new(file)?;

        archive.extract(&mods_dir)?;
        // get root folder from the extracted archive
        let output_path = mods_dir.join(
            archive
                .by_index(0)
                .unwrap()
                .name()
                .split('/')
                .next()
                .unwrap(),
        );

        println!("unzipped file to {:?}", output_path);

        let relative_archive_path = archive_file_path.strip_prefix(&cache_dir).unwrap();
        // get segment after cache_dir
        let relative_output_path = output_path
            .strip_prefix(&cache_dir)?
            .to_str()
            .unwrap()
            .to_string();

        // for i in 0..archive.len() {
        //     let mut file = archive.by_index(i).unwrap();
        //     let outpath = mods_dir.join(file.name());
        //
        //     if (&*file.name()).ends_with('/') {
        //         std::fs::create_dir_all(&outpath).unwrap();
        //     } else {
        //         if let Some(p) = outpath.parent() {
        //             if !p.exists() {
        //                 std::fs::create_dir_all(&p).unwrap();
        //             }
        //         }
        //         let mut outfile = File::create(&outpath).unwrap();
        //         copy(&mut file, &mut outfile).unwrap();
        //     }
        // }

        let game_mod = client
            .game_mod()
            .create(
                source_file_name.to_string(),
                game::id::equals(game_id),
                vec![
                    game_mod::relative_archive_path::set(Some(
                        relative_archive_path.to_str().unwrap().to_string(),
                    )),
                    game_mod::relative_folder_path::set(Some(relative_output_path)),
                ],
            )
            .exec()
            .await?;

        mods.push(game_mod);
    }

    Ok(mods)
}

#[tauri::command]
pub async fn delete_mod(mod_id: i32) -> Result<game_mod::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .delete(game_mod::id::equals(mod_id))
        .exec()
        .await?;

    if game_mod.enabled {
        let game = client
            .game()
            .find_first(vec![game::id::equals(game_mod.game_id)])
            .exec()
            .await?;
    }

    println!("deleting mod {:?}", game_mod);
    if let Some(path) = &game_mod.relative_installed_path {
        println!("deleting mod folder {:?}", path);
        std::fs::remove_dir_all(path)?;
    }

    Ok(game_mod)
}

#[tauri::command]
pub async fn enable_mod(mod_id: i32) -> Result<game_mod::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .update(
            game_mod::id::equals(mod_id),
            vec![game_mod::enabled::set(true)],
        )
        .exec()
        .await
        .unwrap();

    let game = client
        .game()
        .find_first(vec![game::id::equals(game_mod.game_id)])
        .exec()
        .await
        .unwrap();

    if let Some(path) = &game_mod.relative_folder_path {
        if let Some(game) = game {
            let dest = Path::new(&game.game_mod_folder_path).join(path.split("/").last().unwrap());

            let absolute_path = tauri::api::path::app_cache_dir(generate_context!().config())
                .unwrap()
                .join(path);
            println!("symlinked {:?} to {:?}", absolute_path, dest);
            symlink(&absolute_path, &dest).await.unwrap();

            let game_mod = client
                .game_mod()
                .update(
                    game_mod::id::equals(mod_id),
                    vec![game_mod::relative_installed_path::set(Some(
                        dest.to_str().unwrap().to_string(),
                    ))],
                )
                .exec()
                .await
                .unwrap();

            return Ok(game_mod);
        }
    }

    Ok(game_mod)
}

#[tauri::command]
pub async fn disable_mod(mod_id: i32) -> Result<game_mod::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .update(
            game_mod::id::equals(mod_id),
            vec![game_mod::enabled::set(false)],
        )
        .exec()
        .await
        .unwrap();

    let game = client
        .game()
        .find_first(vec![game::id::equals(game_mod.game_id)])
        .exec()
        .await
        .unwrap();

    if let Some(path) = &game_mod.relative_installed_path {
        if let Some(game) = game {
            let game_mod_folder_path =
                Path::new(&game.game_mod_folder_path).join(path.split("/").last().unwrap());
            println!("checking if symlink exists {:?}", game_mod_folder_path);

            println!("removing symlink {:?}", game_mod_folder_path);
            std::fs::remove_dir_all(&game_mod_folder_path).unwrap();

            let game_mod = client
                .game_mod()
                .update(
                    game_mod::id::equals(mod_id),
                    vec![game_mod::relative_installed_path::set(None)],
                )
                .exec()
                .await
                .unwrap();

            return Ok(game_mod);
        }
    }

    Ok(game_mod)
}

#[tauri::command]
pub async fn find_game(game_id: i32) -> Result<game::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game = client
        .game()
        .find_first(vec![game::id::equals(game_id)])
        .exec()
        .await?;

    if let Some(game) = game {
        Ok(game)
    } else {
        Err(Error::StringError("game not found".to_string()))
    }
}

#[tauri::command]
pub async fn find_mod(mod_id: i32) -> Result<game_mod::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .find_first(vec![game_mod::id::equals(mod_id)])
        .exec()
        .await?;

    if let Some(game_mod) = game_mod {
        Ok(game_mod)
    } else {
        Err(Error::StringError("mod not found".to_string()))
    }
}

#[tauri::command]
pub async fn toggle_mod(mod_id: i32) -> Result<game_mod::Data, Error> {
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .find_first(vec![game_mod::id::equals(mod_id)])
        .exec()
        .await?;

    if let Some(game_mod) = game_mod {
        if game_mod.enabled {
            Ok(disable_mod(mod_id).await?)
        } else {
            Ok(enable_mod(mod_id).await?)
        }
    } else {
        Err(Error::StringError("mod not found".to_string()))
    }
}

async fn download_mod_from_url(url: String) -> String {
    let tmp_dir = Builder::new().prefix("temp").tempdir().unwrap();
    let response = reqwest::get(url).await.unwrap();

    let fname = response
        .url()
        .path_segments()
        .and_then(|segments| segments.last())
        .and_then(|name| if name.is_empty() { None } else { Some(name) })
        .unwrap_or("tmp.bin");

    println!("file to download: '{}'", fname);
    let fname = tmp_dir.path().join(fname);
    println!("will be located under: '{:?}'", fname);
    File::create(&fname).unwrap();

    fname.to_str().unwrap().to_string()
}

#[tauri::command]
pub async fn download_mod_details(mod_id: i32, nexus_mod_id: i32) -> Result<game_mod::Data, Error> {
    println!("download_mod_details");
    let client = prisma::new_client().await.unwrap();

    let game_mod = client
        .game_mod()
        .find_first(vec![game_mod::id::equals(mod_id)])
        .exec()
        .await?;

    if let Some(game_mod) = game_mod {
        let game = client
            .game()
            .find_first(vec![game::id::equals(game_mod.game_id)])
            .exec()
            .await?;

        if let Some(game) = game {
            let api_key: Option<&'static str> = option_env!("NEXUS_API_KEY");
            if api_key.is_none() {
                return Err(Error::StringError("NEXUS_API_KEY is not set".to_string()));
            }
            let nexus_integration = NexusIntegration::new(api_key.unwrap().to_string());

            if let Some(nexus_game_identifier) = game.nexus_game_identifier {
                let mod_details = nexus_integration
                    .get_mod_details(nexus_game_identifier, nexus_mod_id)
                    .await;

                let game_mod = client
                    .game_mod()
                    .update(
                        game_mod::id::equals(mod_id),
                        vec![
                            game_mod::name::set(mod_details.name),
                            game_mod::summary::set(Some(mod_details.summary)),
                            game_mod::description::set(Some(bbcode_to_html(&mod_details.description))),
                            game_mod::version::set(Some(mod_details.version)),
                            game_mod::author::set(Some(mod_details.author)),
                            game_mod::picture_url::set(Some(mod_details.picture_url)),
                        ],
                    )
                    .exec()
                    .await?;

                return Ok(game_mod);
            }
        }
    }

    Err(Error::StringError("Could not find game mod".to_string()))
}

struct NexusIntegration {
    api_key: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct User {
    member_id: i32,
    member_group_id: i32,
    name: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct Endorsement {
    endorse_status: String,
    timestamp: Option<String>,
    version: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct ModDetailReponse {
    name: String,
    summary: String,
    description: String,
    picture_url: String,
    mod_downloads: i32,
    mod_unique_downloads: i32,
    uid: usize,
    mod_id: i32,
    game_id: i32,
    allow_rating: bool,
    domain_name: String,
    category_id: i32,
    version: String,
    endorsement_count: i32,
    created_timestamp: i32,
    created_time: String,
    updated_timestamp: i32,
    updated_time: String,
    author: String,
    uploaded_by: String,
    uploaded_users_profile_url: String,
    contains_adult_content: bool,
    status: String,
    available: bool,
    user: User,
    endorsement: Endorsement,
}

impl NexusIntegration {
    const NEXUS_API_ROUTE: &str = "https://api.nexusmods.com/v1";
    fn new(api_key: String) -> Self {
        Self { api_key }
    }

    async fn get_mod_details(self: Self, game_identifier: String, mod_id: i32) -> ModDetailReponse {
        let url = format!(
            "{}/games/{}/mods/{}.json",
            Self::NEXUS_API_ROUTE,
            game_identifier,
            mod_id,
        );

        println!("URL -> {}", url);

        println!("APIKEY -> {}", self.api_key);
        let request = reqwest::Client::new()
            .get(&url)
            .header("apikey", self.api_key)
            .send()
            .await;
        println!("Request -> {:?}", request);
        match request {
            Ok(mod_detail) => match mod_detail.json::<ModDetailReponse>().await {
                Ok(mod_detail) => mod_detail,
                Err(e) => {
                    panic!("Error: {}", e);
                }
            },
            Err(e) => {
                panic!("Error: {}", e);
            }
        }
    }

    async fn get_mod_files(self: Self, game_id: i32, mod_id: i32) -> serde_json::Value {
        reqwest::Client::new()
            .get(format!(
                "{}/games/{}/mods/{}/files",
                Self::NEXUS_API_ROUTE,
                game_id,
                mod_id
            ))
            .header("apikey", self.api_key)
            .send()
            .await
            .unwrap()
            .json::<serde_json::Value>()
            .await
            .unwrap()
    }
}
