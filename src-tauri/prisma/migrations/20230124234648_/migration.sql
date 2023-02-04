/*
  Warnings:

  - You are about to drop the column `gameModFolderPath` on the `GameMod` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameMod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "version" TEXT,
    "author" TEXT,
    "modId" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "relativeArchivePath" TEXT,
    "relativeFolderPath" TEXT,
    "relativeInstalledPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "GameMod_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameMod" ("author", "createdAt", "description", "enabled", "gameId", "id", "modId", "name", "summary", "updatedAt", "version") SELECT "author", "createdAt", "description", "enabled", "gameId", "id", "modId", "name", "summary", "updatedAt", "version" FROM "GameMod";
DROP TABLE "GameMod";
ALTER TABLE "new_GameMod" RENAME TO "GameMod";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
