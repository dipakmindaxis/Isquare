import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface ActivityTypeDto {
  id?: number;
  Id?: number;
  activityTypeId?: number;
  activityName?: string;
  ActivityName?: string;
  activityTypeName?: string;
  ActivityTypeName?: string;
  name?: string;
  value?: string;
  activitySubType?: string;
  ActivitySubType?: string;
  subType?: string;
  SubType?: string;
  isActive?: boolean;
  IsActive?: boolean;
  isDeleted?: boolean;
  IsDeleted?: boolean;
  code?: string;
  Code?: string;
}

export interface ActivityTypeApiResponse {
  data?: ActivityTypeDto[];
  result?: ActivityTypeDto[];
}

export interface ActivityType {
  id: number;
  activityName: string;
  activitySubType: string;
  value: string;
  label: string;
  code: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ActivityTypeCreatePayload {
  activityName: string;
  activitySubType: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ActivityTypeUpdatePayload {
  id: number;
  activityName: string;
  activitySubType: string;
  isActive: boolean;
  isDeleted: boolean;
}

export const getAllActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const response = await apiClient.get<ActivityTypeDto[] | ActivityTypeApiResponse>(API_ENDPOINTS.ActivityType);
    let list: ActivityTypeDto[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      list = response.data.data;
    } else if (response.data && Array.isArray(response.data.result)) {
      list = response.data.result;
    }
    return list
      .map((item: ActivityTypeDto): ActivityType => {
        const name =
          item.activityName ||
          item.ActivityName ||
          item.activityTypeName ||
          item.ActivityTypeName ||
          item.name ||
          item.value ||
          "";
        const idVal = item.id || item.Id || item.activityTypeId || 0;
        const subTypeVal =
          item.activitySubType ||
          item.ActivitySubType ||
          item.subType ||
          item.SubType ||
          "";
        const active = typeof item.isActive === "boolean" ? item.isActive : typeof item.IsActive === "boolean" ? item.IsActive : true;
        const deleted = typeof item.isDeleted === "boolean" ? item.isDeleted : typeof item.IsDeleted === "boolean" ? item.IsDeleted : false;

        return {
          id: idVal,
          activityName: name,
          activitySubType: subTypeVal,
          value: name,
          label: name,
          code: item.code || item.Code || `ACT_${String(idVal).padStart(3, "0")}`,
          isActive: active,
          isDeleted: deleted,
          isActive:
            item.isActive !== undefined
              ? Boolean(item.isActive)
              : item.IsActive !== undefined
                ? Boolean(item.IsActive)
                : true,
          code: item.code ?? item.Code ?? `ACT_${String(item.id ?? item.Id ?? 0).padStart(3, "0")}`,
          category: item.category ?? item.Category ?? "General",
          isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
        };
      })
      .filter((item: ActivityType) => !item.isDeleted);
  } catch (error) {
    console.warn("getAllActivityTypes error:", error);
    return [];
  }
};

export const getActivityTypeById = async (id: number): Promise<ActivityType> => {
  const response = await apiClient.get<ActivityType>(`${API_ENDPOINTS.ActivityType}/${id}`);
  return response.data;
};

export const createActivityType = async (payload: ActivityTypeCreatePayload): Promise<ActivityType> => {
  const requestBody: ActivityTypeCreatePayload = {
    activityName: payload.activityName,
    activitySubType: payload.activitySubType || "",
    isActive: payload.isActive,
    isDeleted: payload.isDeleted || false,
  };

  const response = await apiClient.post<ActivityType>(API_ENDPOINTS.ActivityType, requestBody);
  return response.data;
};

export const updateActivityType = async (id: number, payload: ActivityTypeUpdatePayload): Promise<void> => {
  const requestBody: ActivityTypeUpdatePayload = {
    id,
    activityName: payload.activityName,
    activitySubType: payload.activitySubType || "",
    isActive: payload.isActive,
    isDeleted: payload.isDeleted || false,
  };

  await apiClient.put(`${API_ENDPOINTS.ActivityType}/${id}`, requestBody);
};

export const deleteActivityType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.ActivityType}/${id}`);
};

// Aliases for compatibility
export interface ActivityOutcomeItem {
  id: number;
  activityName: string;
  activitySubType: string;
  value: string;
  label: string;
  code: string;
  isActive: boolean;
}

export const getActivityOutcomes = getAllActivityTypes;
export const saveActivityOutcome = async (
  item: Omit<ActivityType, "id"> & { id?: number; value?: string }
): Promise<ActivityType> => {
  const name = item.activityName || item.value || "";
  const subType = item.activitySubType || "";
  const idNum = item.id || 0;
  if (idNum > 0) {
    await updateActivityType(idNum, {
      id: idNum,
      activityName: name,
      activitySubType: subType,
      isActive: item.isActive,
      isDeleted: false,
    });
    return {
      id: idNum,
      activityName: name,
      activitySubType: subType,
      value: name,
      label: name,
      code: item.code || `ACT_${String(idNum).padStart(3, "0")}`,
      isActive: item.isActive,
      isDeleted: false,
    };
  } else {
    return await createActivityType({
      activityName: name,
      activitySubType: subType,
      isActive: item.isActive,
      isDeleted: false,
    });
  }
};
export const deleteActivityOutcome = deleteActivityType;
