import axios from "axios";
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
export const getEnquiryPriorities = () => fetchMaster(API_ENDPOINTS.EnquiryPriorities, 'enquiryPriorityId', 'enquiryPriorityName');
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