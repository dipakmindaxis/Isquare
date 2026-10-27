import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";

export interface MeetingType {
  id: number;
  meetingTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export interface MeetingTypeCreatePayload {
  meetingTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export interface MeetingTypeUpdatePayload {
  id?: number;
  meetingTypeName: string;
  isActive: boolean;
  code?: string;
  isDeleted?: boolean;
}

export const getAllMeetingTypes = async (): Promise<MeetingType[]> => {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.MeetingType);
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
          item.meetingTypeName ??
          item.MeetingTypeName ??
          item.name ??
          item.value ??
          "";
        return {
          id: item.id ?? item.Id ?? item.meetingTypeId ?? 0,
          meetingTypeName: name,
          value: name,
          label: name,
          code:
            item.code ??
            item.Code ??
            `MEET_${String(item.id ?? item.Id ?? 0).padStart(3, "0")}`,
          isActive:
            item.isActive !== undefined
              ? Boolean(item.isActive)
              : item.IsActive !== undefined
                ? Boolean(item.IsActive)
                : true,
          isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
        };
      })
      .filter((item: any) => !item.isDeleted);
  } catch (error) {
    console.warn("getAllMeetingTypes API error:", error);
    return [];
  }
};

export const getMeetingTypeById = async (id: number): Promise<MeetingType> => {
  const response = await apiClient.get<MeetingType>(`${API_ENDPOINTS.MeetingType}/${id}`);
  return response.data;
};

export const createMeetingType = async (payload: MeetingTypeCreatePayload): Promise<MeetingType> => {
  const requestBody = {
    meetingTypeName: payload.meetingTypeName,
    isActive: payload.isActive,
  };
  const response = await apiClient.post<MeetingType>(API_ENDPOINTS.MeetingType, requestBody);
  return response.data;
};

export const updateMeetingType = async (id: number, payload: MeetingTypeUpdatePayload): Promise<void> => {
  const requestBody = {
    id,
    meetingTypeName: payload.meetingTypeName,
    isActive: payload.isActive,
  };
  await apiClient.put(`${API_ENDPOINTS.MeetingType}/${id}`, requestBody);
};

export const deleteMeetingType = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.MeetingType}/${id}`);
};

// Aliases for compatibility
export interface MeetingTypeItem {
  id: number;
  meetingTypeName: string;
  value: string;
  label: string;
  code: string;
  isActive: boolean;
}

export const getMeetingTypes = getAllMeetingTypes;
export const saveMeetingType = async (
  item: Omit<MeetingType, "id"> & { id?: number; value?: string }
): Promise<MeetingType> => {
  const name = item.meetingTypeName || item.value || "";
  if (item.id) {
    await updateMeetingType(item.id, {
      id: item.id,
      meetingTypeName: name,
      isActive: item.isActive,
    });
    return { id: item.id, meetingTypeName: name, isActive: item.isActive };
  } else {
    return await createMeetingType({
      meetingTypeName: name,
      isActive: item.isActive,
    });
  }
};
