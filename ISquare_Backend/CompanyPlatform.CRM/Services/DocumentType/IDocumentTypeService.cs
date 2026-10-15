using CompanyPlatform.CRM.DTO.DocumentType;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.DocumentType
{
    public interface IDocumentTypeService
    {
        Task<IEnumerable<DocumentTypeDto>> GetAllDocumentTypesAsync();

        Task<DocumentTypeDto> GetDocumentTypeByIdAsync(int id);

        Task<DocumentTypeDto> CreateDocumentTypeAsync(DocumentTypeDto dto);

        Task<bool> UpdateDocumentTypeAsync(int id, DocumentTypeDto dto);

        Task<bool> DeleteDocumentTypeAsync(int id);
    }
}