using CompanyPlatform.CRM.DTO.Product;
using CompanyPlatform.CRM.Services.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/product")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductController> _logger;

        public ProductController(
            IProductService productService,
            ILogger<ProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // GET: api/product
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products =
                await _productService.GetAllProductsAsync();

            return Ok(products);
        }

        // GET: api/product/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product =
                await _productService.GetProductByIdAsync(id);

            if (product == null)
                return NotFound(new { Message = "Product not found." });

            return Ok(product);
        }

        // POST: api/product
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] ProductDto productDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdProduct =
                await _productService.CreateProductAsync(productDto);

            return Ok(createdProduct);
        }

        // PUT: api/product/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] ProductDto productDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _productService.UpdateProductAsync(id, productDto);

            if (!updated)
                return NotFound(new { Message = "Product not found." });

            return Ok(new { Message = "Product updated successfully." });
        }

        // DELETE: api/product/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _productService.DeleteProductAsync(id);

            if (!deleted)
                return NotFound(new { Message = "Product not found." });

            return Ok(new { Message = "Product deleted successfully." });
        }

        // POST: api/product/import
        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportExcel([FromForm] ProductImportRequestDto dto)
        {
            var targetExcel = dto?.ExcelFile ?? dto?.File;
            if (targetExcel == null || targetExcel.Length == 0)
                return BadRequest(new { Message = "Please select a valid Excel file (.xlsx or .xls)." });

            var excelExt = Path.GetExtension(targetExcel.FileName).ToLowerInvariant();
            if (excelExt != ".xlsx" && excelExt != ".xls")
                return BadRequest(new { Message = "Invalid file type. Only Excel files (.xlsx, .xls) are allowed." });

            Stream? zipStream = null;
            if (dto?.ZipFile != null && dto.ZipFile.Length > 0)
            {
                var zipExt = Path.GetExtension(dto.ZipFile.FileName).ToLowerInvariant();
                if (zipExt != ".zip")
                    return BadRequest(new { Message = "Invalid file type for images. Only .zip files are allowed." });

                zipStream = dto.ZipFile.OpenReadStream();
            }

            try
            {
                using var excelStream = targetExcel.OpenReadStream();
                var result = await _productService.ImportProductsFromExcelAsync(excelStream, zipStream);
                return Ok(result);
            }
            finally
            {
                zipStream?.Dispose();
            }
        }

        // POST: api/product/bulk-import
        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImport([FromBody] List<ProductExcelRowDto> records)
        {
            if (records == null || !records.Any())
                return BadRequest(new { Message = "No product records provided for import." });

            var result = await _productService.BulkImportProductsAsync(records);
            return Ok(result);
        }

        // GET: api/product/import-template
        [HttpGet("import-template")]
        public IActionResult DownloadTemplate()
        {
            var bytes = _productService.GenerateExcelTemplate();
            return File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Product_Import_Template.xlsx");
        }
    }
}
