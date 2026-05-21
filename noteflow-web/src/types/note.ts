export interface TagResponseDto {
  id: string;
  name: string;
}

export interface NoteResponseDto {
  id: string;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: TagResponseDto[];
}

export interface NoteCreateRequest {
  title?: string;
  content: string;
  tagIds?: string[];
}

export interface NoteUpdateRequest {
  title?: string;
  content: string;
}