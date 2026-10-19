export interface Director {
  directorId: number;
  directorName: string;
  directorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DirectorCreatePayload {
  directorName: string;
  directorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface DirectorUpdatePayload {
  directorId?: number;
  directorName: string;
  directorCode: string;
  isActive: boolean;
  isDeleted?: boolean;
}
