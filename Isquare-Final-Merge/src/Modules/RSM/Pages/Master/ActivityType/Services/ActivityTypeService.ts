import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface ActivityType {
  id: number;
  activityName: string;
  value?: string;
  label?: string;
  isActive: boolean;
  code?: string;
  category?: "Call" | "Meeting" | "General";
  isDeleted?: boolean;
}

export interface ActivityTypeCreatePayload {
  activityName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export interface ActivityTypeUpdatePayload {
  id?: number;
  activityName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export const getAllActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.ActivityType);
    let list: any[] = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data && Array.isArray((response.data as any).data)) {
      list = (response.data as any).data;
    } else if (response.data && Array.isArray((response.data as any).result)) {
      list = (response.data as any).result;
    }
    return list
      .map((item: any) => {
        const name =
          item.activityName ??
          item.ActivityName ??
          item.activityTypeName ??
          item.ActivityTypeName ??
          item.name ??
          item.value ??
          "";
        return {
          id: item.id ?? item.Id ?? item.activityTypeId ?? 0,
          activityName: name,
          value: name,
          label: name,
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
      .filter((item: any) => !item.isDeleted);
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
  const requestBody = {
    activityName: payload.activityName,
    isActive: payload.isActive,
    isDeleted: payload.isDeleted ?? false,
  };
  const response = await apiClient.post<ActivityType>(API_ENDPOINTS.ActivityType, requestBody);
  return response.data;
};

export const updateActivityType = async (id: number, payload: ActivityTypeUpdatePayload): Promise<void> => {
  const requestBody = {
    id,
    activityName: payload.activityName,
    isActive: payload.isActive,
    isDeleted: payload.isDeleted ?? false,
  };
  await apiClient.put(`${API_ENDPOINTS.ActivityType}/${id}`, requestBody);
};

export const deleteActivityType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.ActivityType}/${id}`);
};

// Aliases for compatibility with any existing components
export interface ActivityOutcomeItem {
  id: number;
  activityName: string;
  value: string;
  label: string;
  code: string;
  category: "General" | "Call" | "Meeting";
  isActive: boolean;
}

export const getActivityOutcomes = getAllActivityTypes;
export const saveActivityOutcome = async (
  item: Omit<ActivityType, "id"> & { id?: number; value?: string }
): Promise<ActivityType> => {
  const name = item.activityName || item.value || "";
  if (item.id) {
    await updateActivityType(item.id, {
      id: item.id,
      activityName: name,
      isActive: item.isActive,
    });
    return { id: item.id, activityName: name, isActive: item.isActive };
  } else {
    return await createActivityType({
      activityName: name,
      isActive: item.isActive,
    });
  }
};
export const deleteActivityOutcome = deleteActivityType;
