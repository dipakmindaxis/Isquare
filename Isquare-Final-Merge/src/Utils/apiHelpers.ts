/**
 * Universal API Normalizer for ASP.NET Core & REST endpoints in ISquare.
 * Handles:
 * - Direct arrays: [item1, item2]
 * - Wrapped arrays: { data: [...] }, { result: [...] }, { items: [...] }, { records: [...] }, { value: [...] }
 * - PascalCase responses: { Data: [...] }, { Result: [...] }, { Items: [...] }
 * - ASP.NET Core cyclical reference loop objects: { $values: [...] }, { data: { $values: [...] } }
 * - Single entity responses: { data: {...} }, { result: {...} }
 */

export function normalizeApiResponse<T = any>(payload: any): T[] {
  if (!payload) return [];

  // 1. Direct array
  if (Array.isArray(payload)) {
    return payload;
  }

  // 2. Direct .NET $values array
  if (Array.isArray(payload?.$values)) {
    return payload.$values;
  }

  // 3. Inspect common nested container keys
  if (typeof payload === 'object') {
    // data / Data
    const dataObj = payload.data !== undefined ? payload.data : payload.Data;
    if (dataObj) {
      if (Array.isArray(dataObj)) return dataObj;
      if (Array.isArray(dataObj?.$values)) return dataObj.$values;
      if (typeof dataObj === 'object') {
        if (Array.isArray(dataObj.items)) return dataObj.items;
        if (Array.isArray(dataObj.records)) return dataObj.records;
        if (Array.isArray(dataObj.result)) return dataObj.result;
        if (Array.isArray(dataObj.$values)) return dataObj.$values;
      }
    }

    // result / Result
    const resultObj = payload.result !== undefined ? payload.result : payload.Result;
    if (resultObj) {
      if (Array.isArray(resultObj)) return resultObj;
      if (Array.isArray(resultObj?.$values)) return resultObj.$values;
      if (typeof resultObj === 'object') {
        if (Array.isArray(resultObj.items)) return resultObj.items;
        if (Array.isArray(resultObj.$values)) return resultObj.$values;
      }
    }

    // items / Items
    const itemsObj = payload.items !== undefined ? payload.items : payload.Items;
    if (Array.isArray(itemsObj)) return itemsObj;
    if (Array.isArray(itemsObj?.$values)) return itemsObj.$values;

    // records / Records
    const recordsObj = payload.records !== undefined ? payload.records : payload.Records;
    if (Array.isArray(recordsObj)) return recordsObj;
    if (Array.isArray(recordsObj?.$values)) return recordsObj.$values;

    // value / Value
    const valueObj = payload.value !== undefined ? payload.value : payload.Value;
    if (Array.isArray(valueObj)) return valueObj;
    if (Array.isArray(valueObj?.$values)) return valueObj.$values;

    // list / List
    const listObj = payload.list !== undefined ? payload.list : payload.List;
    if (Array.isArray(listObj)) return listObj;
    if (Array.isArray(listObj?.$values)) return listObj.$values;
  }

  return [];
}

export function normalizeApiRecord<T = any>(payload: any): T {
  if (!payload || typeof payload !== 'object') {
    return payload as T;
  }

  // Unwrap common single object wrappers: { data: {...} }, { result: {...} }
  if (payload.data !== undefined && payload.data !== null && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data as T;
  }
  if (payload.Data !== undefined && payload.Data !== null && typeof payload.Data === 'object' && !Array.isArray(payload.Data)) {
    return payload.Data as T;
  }
  if (payload.result !== undefined && payload.result !== null && typeof payload.result === 'object' && !Array.isArray(payload.result)) {
    return payload.result as T;
  }
  if (payload.Result !== undefined && payload.Result !== null && typeof payload.Result === 'object' && !Array.isArray(payload.Result)) {
    return payload.Result as T;
  }

  return payload as T;
}
