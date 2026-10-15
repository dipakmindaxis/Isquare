using CompanyPlatform.CRM.DTO.Product;
using CompanyPlatform.CRM.Services.Product;
using Microsoft.AspNetCore.Authorization;
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
    }
}