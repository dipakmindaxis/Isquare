using CompanyPlatform.CRM.DTO.History;

namespace CompanyPlatform.CRM.Services.History
{
    public interface IHistoryService
    {
        Task<IEnumerable<HistoryDto>> GetAllHistoryAsync();
        Task<HistoryDto> GetHistoryByIdAsync(int id);
        Task<HistoryDto> CreateHistoryAsync(HistoryDto historyDto);
        Task<bool> UpdateHistoryAsync(int id, HistoryDto historyDto);
        Task<bool> DeleteHistoryAsync(int id);
    }
}