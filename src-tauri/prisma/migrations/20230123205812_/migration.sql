/*
  Warnings:

  - You are about to alter the column `modId` on the `GameMod` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameMod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gameModFolderPath" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "modId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "GameMod_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameMod" ("author", "createdAt", "description", "enabled", "gameId", "gameModFolderPath", "id", "modId", "name", "summary", "updatedAt", "version") SELECT "author", "createdAt", "description", "enabled", "gameId", "gameModFolderPath", "id", "modId", "name", "summary", "updatedAt", "version" FROM "GameMod";
DROP TABLE "GameMod";
ALTER TABLE "new_GameMod" RENAME TO "GameMod";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
