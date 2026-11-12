using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Product
{
    public class ProductExcelRowDto
    {
        public int RowIndex { get; set; }
        public string? ItemCode { get; set; }

        [Required(ErrorMessage = "Product Name is required.")]
        public string ProductName { get; set; } = string.Empty;

        public string? Brand { get; set; }
        public string? Specification { get; set; }
        public string? DefaultUom { get; set; }
        public int? UnitOfMeasurementId { get; set; }

        [Range(0, 9999999999999999, ErrorMessage = "Standard Rate must be a valid positive number.")]
        public decimal StandardRate { get; set; }

        [Range(0, 100, ErrorMessage = "GST Rate must be between 0 and 100.")]
        public decimal GSTRate { get; set; } = 18;

        public string? HsnCode { get; set; }
        public decimal? PurchaseRate { get; set; }
        public decimal? ProfitPercentage { get; set; }
        public int? Stock { get; set; }
        public string? ProductImage { get; set; }

        public bool IsValid { get; set; } = true;
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class ProductImportErrorDto
    {
        public int RowNumber { get; set; }
        public string? ItemCode { get; set; }
        public string? ProductName { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class ProductImportRequestDto
    {
        public Microsoft.AspNetCore.Http.IFormFile? ExcelFile { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? File { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? ZipFile { get; set; }
    }

    public class ProductImportResultDto
    {
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int DuplicateCount { get; set; }
        public int FailedCount { get; set; }
        public int ImagesExtracted { get; set; }
        public int ImagesMatched { get; set; }
        public int ImagesLinked { get; set; }
        public List<string> MissingImages { get; set; } = new();
        public List<string> ImageWarnings { get; set; } = new();
        public List<ProductImportErrorDto> Errors { get; set; } = new();
        public List<ProductDto> ImportedProducts { get; set; } = new();
        public string Message { get; set; } = string.Empty;

        public bool Success => FailedCount == 0 && (SuccessCount > 0 || TotalRecords == 0);
        public int ImportedCount => SuccessCount;
    }
}

