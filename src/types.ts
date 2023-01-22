export interface Game {
  id: number;
  name: string;
  gameModFolderPath: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GameMod {
  id: number;
  name: string;
  summary: string;
  description: string;
  gameModFolderPath: string;
  version: string;
  author: string;
  cretedAt: number;
  updatedAt: number;
}
