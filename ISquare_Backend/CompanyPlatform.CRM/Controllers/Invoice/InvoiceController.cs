using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CompanyPlatform.CRM.DTO.Invoice;
using CompanyPlatform.CRM.Services.InvoiceService;

namespace CompanyPlatform.CRM.Controllers.Invoice
{
	[Route("api/[controller]")]
	[ApiController]
	[Authorize]
	public class InvoiceController : ControllerBase
	{
		private readonly IInvoiceService _invoiceService;

		public InvoiceController(IInvoiceService invoiceService)
		{
			_invoiceService = invoiceService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAll()
		{
			var invoices = await _invoiceService.GetAllInvoicesAsync();
			return Ok(invoices);
		}

		[HttpGet("next-number")]
		public async Task<IActionResult> GetNextInvoiceNumber([FromQuery] string docType = "Invoice")
		{
			var nextNumber = await _invoiceService.GetNextInvoiceNumberAsync(docType);
			return Ok(new
			{
				invoiceNumber = nextNumber
			});
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<InvoiceDto>> GetById(int id)
		{
			var invoice = await _invoiceService.GetInvoiceByIdAsync(id);

			if (invoice == null)
				return NotFound(new { message = "Invoice not found." });

			return Ok(invoice);
		}

		[HttpPost]
		public async Task<IActionResult> Create([FromBody] InvoiceDto invoiceDto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var result = await _invoiceService.CreateInvoiceAsync(invoiceDto);

			return Ok(new
			{
				message = "Invoice created successfully.",
				data = result
			});
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, [FromBody] InvoiceDto invoiceDto)
		{
			if (id != invoiceDto.InvoiceId)
				return BadRequest(new { message = "Invoice ID mismatch." });

			var updated = await _invoiceService.UpdateInvoiceAsync(invoiceDto);

			if (!updated)
				return NotFound(new { message = "Invoice not found." });

			return Ok(new
			{
				message = "Invoice updated successfully."
			});
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			var deleted = await _invoiceService.DeleteInvoiceAsync(id);

			if (!deleted)
				return NotFound(new { message = "Invoice not found." });

			return Ok(new
			{
				message = "Invoice deleted successfully."
			});
		}
	}
}