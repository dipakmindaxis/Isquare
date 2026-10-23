import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { HierarchyLevel } from "./RoleAssignmentStaticData";

export interface LevelMasterBackendDto {
  id?: number;
  ID?: number;
  levelName?: string;
  LevelName?: string;
  levelOrder?: number;
  LevelOrder?: number;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
}

export interface CreateLevelPayload {
  levelName: string;
  levelOrder: number;
  isActive: boolean;
}

export interface UpdateLevelPayload {
  levelName: string;
  levelOrder: number;
  isActive: boolean;
}

const mapBackendToHierarchyLevel = (item: LevelMasterBackendDto): HierarchyLevel => {
  return {
    id: Number(item.id ?? item.ID ?? 0),
    levelName: item.levelName ?? item.LevelName ?? "",
    levelOrder: Number(item.levelOrder ?? item.LevelOrder ?? 1),
    isActive: Boolean(item.isActive ?? item.IsActive ?? true),
  };
};

export const getLevels = async (): Promise<HierarchyLevel[]> => {
  try {
    const response = await apiClient.get<LevelMasterBackendDto[] | { data?: LevelMasterBackendDto[] }>(
      API_ENDPOINTS.Levels
    );
    const data = response.data;
    const rawList: LevelMasterBackendDto[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    return rawList
      .map(mapBackendToHierarchyLevel)
      .sort((a, b) => a.levelOrder - b.levelOrder);
  } catch (err) {
    console.error("Error fetching levels from backend:", err);
    throw err;
  }
};

export const getLevelById = async (id: number): Promise<HierarchyLevel | null> => {
  try {
    const response = await apiClient.get<LevelMasterBackendDto>(`${API_ENDPOINTS.Levels}/${id}`);
    if (!response.data) return null;
    return mapBackendToHierarchyLevel(response.data);
  } catch (err) {
    console.error(`Error fetching level ${id}:`, err);
    return null;
  }
};

export const createLevel = async (payload: CreateLevelPayload): Promise<HierarchyLevel> => {
  const response = await apiClient.post<LevelMasterBackendDto>(API_ENDPOINTS.Levels, {
    levelName: payload.levelName.trim(),
    levelOrder: payload.levelOrder,
    isActive: payload.isActive,
  });
  return mapBackendToHierarchyLevel(response.data);
};

export const updateLevel = async (id: number, payload: UpdateLevelPayload): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.Levels}/${id}`, {
    levelName: payload.levelName.trim(),
    levelOrder: payload.levelOrder,
    isActive: payload.isActive,
  });
};

export const deleteLevel = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Levels}/${id}`);
};
