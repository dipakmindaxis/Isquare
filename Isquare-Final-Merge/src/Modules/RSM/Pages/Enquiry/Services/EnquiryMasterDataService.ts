import axios from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig"; 
import type { MasterItem } from "../Types/EnquiryTypes";

const fetchMaster = async (url: string, idField: string, nameField: string): Promise<MasterItem[]> => {
  try {
    const res = await axios.get(`${url}/active`); // Fetching active records only
    return res.data.map((item: any) => ({
      id: item[idField],
      name: item[nameField],
    }));
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return [];
  }
};

export const getEnquiryTypes = () => fetchMaster(API_ENDPOINTS.EnquiryTypes, 'enquiryTypeId', 'enquiryTypeName');
export const getEnquirySources = () => fetchMaster(API_ENDPOINTS.EnquirySources, 'enquirySourceId', 'enquirySourceName');
export const getProductCategories = () => fetchMaster(API_ENDPOINTS.ProductCategory || `${API_ENDPOINTS.BaseUrl}/ProductCategory`, 'productCategoryId', 'productCategoryName');
export const getUOMs = () => fetchMaster(API_ENDPOINTS.UnitOfMeasures, 'unitOfMeasureId', 'unitOfMeasureName');
export const getPlacesOfSupply = () => fetchMaster(API_ENDPOINTS.PlaceOfSupplies, 'placeOfSupplyId', 'placeOfSupplyName');
export const getCurrencies = () => fetchMaster(API_ENDPOINTS.Currencies, 'currencyId', 'currencyCode');
export const getEnquiryStatuses = () => fetchMaster(API_ENDPOINTS.EnquiryStatuses, 'enquiryStatusId', 'enquiryStatusName');
export const getEnquiryStages = () => fetchMaster(API_ENDPOINTS.EnquiryStages, 'enquiryStageId', 'enquiryStageName');
export const getEnquiryPriorities = async (): Promise<MasterItem[]> => {
  try {
    // Database table tbl_Priority data is served by /api/priority (with fallback to EnquiryPriorities)
    const priorityUrls = [
      API_ENDPOINTS.Priority || `${API_ENDPOINTS.BaseUrl}/priority`,
      API_ENDPOINTS.Priorities || `${API_ENDPOINTS.BaseUrl}/priority`,
      API_ENDPOINTS.EnquiryPriorities ? `${API_ENDPOINTS.EnquiryPriorities}/active` : "",
      API_ENDPOINTS.EnquiryPriorities || `${API_ENDPOINTS.BaseUrl}/EnquiryPriority`,
    ].filter(Boolean);

    let list: any[] = [];

    // Try fetching with apiClient (sends auth header)
    for (const url of priorityUrls) {
      try {
        const res = await apiClient.get(url);
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
        if (Array.isArray(data) && data.length > 0) {
          list = data;
          break;
        }
      } catch {
        // Try next candidate
      }
    }

    // Fallback to axios if apiClient didn't return data
    if (list.length === 0) {
      for (const url of priorityUrls) {
        try {
          const res = await axios.get(url);
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
          if (Array.isArray(data) && data.length > 0) {
            list = data;
            break;
          }
        } catch {
          // Try next candidate
        }
      }
    }

    return list
      .filter((item: any) => item.isActive !== false && item.IsActive !== false && !item.isDeleted && !item.IsDeleted)
      .map((item: any) => ({
        id: Number(item.id ?? item.Id ?? item.priorityId ?? item.PriorityId ?? item.enquiryPriorityId ?? item.EnquiryPriorityId ?? 0),
        name: String(
          item.priorityName ??
          item.PriorityName ??
          item.name ??
          item.Name ??
          item.enquiryPriorityName ??
          item.EnquiryPriorityName ??
          ""
        ),
      }))
      .filter((item: MasterItem) => item.id > 0 && item.name.trim().length > 0);
  } catch (error) {
    console.error("Error fetching priorities:", error);
    return [];
  }
};
export const getTerritories = () => fetchMaster(API_ENDPOINTS.SalesTerritories, 'salesTerritoryId', 'salesTerritoryName');
export const getLostReasons = () => fetchMaster(API_ENDPOINTS.LostReasons, 'lostReasonId', 'lostReasonName');
export const getDepartments = async (): Promise<MasterItem[]> => {
  try {
    // The Department API does not have an /active endpoint, so we fetch directly
    const res = await axios.get(API_ENDPOINTS.Departments);
    return res.data.map((item: any) => ({
      id: item.id || item.ID,
      name: item.departmentName,
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};
export const getActivityTypes = () => fetchMaster(API_ENDPOINTS.ActivityType, 'id', 'activityName');