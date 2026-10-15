using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.DTO.Invoice;
using CompanyPlatform.CRM.Services.InvoicePayment;

namespace CompanyPlatform.CRM.Controllers.Invoice
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoicePaymentController : ControllerBase
    {
        private readonly IInvoicePaymentService _invoicePaymentService;

        public InvoicePaymentController(IInvoicePaymentService invoicePaymentService)
        {
            _invoicePaymentService = invoicePaymentService;
        }

        // GET: api/InvoicePayment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoicePaymentDto>>> GetAll()
        {
            var payments = await _invoicePaymentService.GetAllInvoicePaymentsAsync();
            return Ok(payments);
        }

        // GET: api/InvoicePayment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoicePaymentDto>> GetById(int id)
        {
            var payment = await _invoicePaymentService.GetInvoicePaymentByIdAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Invoice Payment not found."
                });
            }

            return Ok(payment);
        }

        // POST: api/InvoicePayment
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvoicePaymentDto invoicePaymentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdPayment = await _invoicePaymentService.CreateInvoicePaymentAsync(invoicePaymentDto);

            return Ok(new
            {
                message = "Invoice Payment created successfully.",
                data = createdPayment
            });
        }

        // PUT: api/InvoicePayment/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InvoicePaymentDto invoicePaymentDto)
        {
            if (id != invoicePaymentDto.PaymentId)
            {
                return BadRequest(new
                {
                    message = "Payment ID mismatch."
                });
            }

            var updated = await _invoicePaymentService.UpdateInvoicePaymentAsync(id, invoicePaymentDto);

            if (!updated)
            {
                return NotFound(new
                {
                    message = "Invoice Payment not found."
                });
            }

            return Ok(new
            {
                message = "Invoice Payment updated successfully."
            });
        }

        // DELETE: api/InvoicePayment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoicePaymentService.DeleteInvoicePaymentAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Invoice Payment not found."
                });
            }

            return Ok(new
            {
                message = "Invoice Payment deleted successfully."
            });
        }
    }
}