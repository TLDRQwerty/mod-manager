export interface Game {
  id: number;
  name: string;
  gameModFolderPath: string[];
  nexusGameIdentifier: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Mod {
  id: number;
  name?: string;
  summary?: string;
  description?: string;
  version?: string;
  author?: string;
  enabled: boolean;
  note?: string;
  pictureUrl?: string;
  cretedAt: number;
  updatedAt: number;

  relativeFolderPath?: string;
  relativeArchivePath?: string;
  relativeInstalledPath?: string;
}
