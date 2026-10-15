import apiClient from "../../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../../API/apiConfig";

export interface ActivityType {
  id: number;
  activityName: string;
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
  const response = await apiClient.get<ActivityType[]>(API_ENDPOINTS.ActivityType);
  return response.data;
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
