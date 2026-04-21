export interface Account {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
}

export interface Folder {
  id: number;
  user_id: number;
  parent_folder_id: number | null;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Document {
  id: number;
  owner_id: number;
  folder_id: number | null;
  title: string;
  content: string;
  favorite: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface DocTag {
  doc_id: number;
  tag_id: number;
}