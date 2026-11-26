using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.Quotation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QuotationModel = CompanyPlatform.Core.Models.CRM.Quotation;
using CompanyEntity = CompanyPlatform.Core.Models.CRM.Company;
using CompanyAddressEntity = CompanyPlatform.Core.Models.CRM.CompanyAddress;
using CompanyEmailEntity = CompanyPlatform.Core.Models.CRM.CompanyEmail;
using CompanyContactEntity = CompanyPlatform.Core.Models.CRM.CompanyContact;
using CompanyProfileEntity = CompanyPlatform.Core.Models.CRM.CompanyProfile;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationCustomerResponseService : IQuotationCustomerResponseService
    {
        private readonly IRepositories<QuotationCustomerResponse> _responseRepository;
        private readonly IRepositories<QuotationModel> _quotationRepository;
        private readonly IRepositories<CompanyEntity> _companyRepository;
        private readonly IRepositories<CompanyAddressEntity> _companyAddressRepository;
        private readonly IRepositories<CompanyEmailEntity> _companyEmailRepository;
        private readonly IRepositories<CompanyContactEntity> _companyContactRepository;
        private readonly IRepositories<CompanyProfileEntity> _companyProfileRepository;
        private readonly IQuotationService _quotationService;
        private readonly IQuotationItemService _quotationItemService;
        private readonly IQuotationChargeService _quotationChargeService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<QuotationCustomerResponseService> _logger;

        public QuotationCustomerResponseService(
            IRepositories<QuotationCustomerResponse> responseRepository,
            IRepositories<QuotationModel> quotationRepository,
            IRepositories<CompanyEntity> companyRepository,
            IRepositories<CompanyAddressEntity> companyAddressRepository,
            IRepositories<CompanyEmailEntity> companyEmailRepository,
            IRepositories<CompanyContactEntity> companyContactRepository,
            IRepositories<CompanyProfileEntity> companyProfileRepository,
            IQuotationService quotationService,
            IQuotationItemService quotationItemService,
            IQuotationChargeService quotationChargeService,
            IEmailService emailService,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            ILogger<QuotationCustomerResponseService> logger)
        {
            _responseRepository = responseRepository;
            _quotationRepository = quotationRepository;
            _companyRepository = companyRepository;
            _companyAddressRepository = companyAddressRepository;
            _companyEmailRepository = companyEmailRepository;
            _companyContactRepository = companyContactRepository;
            _companyProfileRepository = companyProfileRepository;
            _quotationService = quotationService;
            _quotationItemService = quotationItemService;
            _quotationChargeService = quotationChargeService;
            _emailService = emailService;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        private static bool IsLocalhostUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            if (Uri.TryCreate(url, UriKind.Absolute, out var uri))
                return uri.IsLoopback || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);

            return url.Contains("localhost", StringComparison.OrdinalIgnoreCase) ||
                   url.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase);
        }

        private string GetClientBaseUrl()
        {
            var configuredUrl = _configuration["AppSettings:ClientAppUrl"]?.Trim().TrimEnd('/');
            var request = _httpContextAccessor.HttpContext?.Request;

            if (request != null && request.Host.HasValue)
            {
                var requestHost = request.Host.Host;
                var isRequestLocal = requestHost.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                                     requestHost.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);

                // In deployed environments, prefer the live HTTPS origin if ClientAppUrl is unset or still points to localhost
                if (!isRequestLocal && (string.IsNullOrWhiteSpace(configuredUrl) || IsLocalhostUrl(configuredUrl)))
                {
                    var forwardedProto = request.Headers["X-Forwarded-Proto"].FirstOrDefault();
                    var scheme = !string.IsNullOrWhiteSpace(forwardedProto)
                        ? forwardedProto.Split(',')[0].Trim()
                        : (request.IsHttps ? "https" : "https");
                    return $"{scheme}://{request.Host.Value}".TrimEnd('/');
                }
            }

            return configuredUrl ?? string.Empty;
        }

        private string BuildPublicUrl(Guid publicResponseId)
        {
            var baseUrl = GetClientBaseUrl();
            var rawBasePath = (_configuration["AppSettings:ClientBasePath"] ?? "/frontend").Trim().Trim('/');
            var basePath = string.IsNullOrEmpty(rawBasePath) ? string.Empty : $"/{rawBasePath}";

            if (!string.IsNullOrEmpty(basePath) &&
                baseUrl.EndsWith(basePath, StringComparison.OrdinalIgnoreCase))
            {
                basePath = string.Empty;
            }

            var path = $"{basePath}/quotation-response/{publicResponseId}";
            return string.IsNullOrEmpty(baseUrl) ? path : $"{baseUrl}{path}";
        }

        private async Task<string?> ResolveCustomerEmailAsync(CompanyEntity? customer, string? overrideEmail)
        {
            if (!string.IsNullOrWhiteSpace(overrideEmail))
                return overrideEmail.Trim();

            if (customer == null)
                return null;

            if (!string.IsNullOrWhiteSpace(customer.Email))
                return customer.Email.Trim();

            var companyEmails = await _companyEmailRepository.FindByCondition(
                e => e.CompanyId == customer.CompanyId && !e.IsDeleted);
            var primaryEmail = companyEmails
                .OrderByDescending(e => e.IsPrimary)
                .FirstOrDefault(e => !string.IsNullOrWhiteSpace(e.Email));
            if (primaryEmail != null)
                return primaryEmail.Email.Trim();

            var contacts = await _companyContactRepository.FindByCondition(
                c => c.CompanyId == customer.CompanyId && !c.IsDeleted && c.IsActive);
            var primaryContact = contacts
                .OrderByDescending(c => c.IsPrimary)
                .FirstOrDefault(c => !string.IsNullOrWhiteSpace(c.Email));
            if (primaryContact != null)
                return primaryContact.Email.Trim();

            return !string.IsNullOrWhiteSpace(customer.AlternateEmail)
                ? customer.AlternateEmail.Trim()
                : null;
        }

        public async Task<QuotationCustomerResponseDto> SendQuotationEmailAsync(
            int quotationId,
            SendQuotationEmailDto? dto = null)
        {
            var quotation = await _quotationRepository.GetByIdAsync(quotationId);
            if (quotation == null || quotation.IsDeleted)
                throw new KeyNotFoundException($"Quotation with ID {quotationId} not found.");

            var customer = quotation.CustomerId > 0
                ? await _companyRepository.GetByIdAsync(quotation.CustomerId)
                : null;

            var customerEmail = await ResolveCustomerEmailAsync(customer, dto?.CustomerEmail);
            if (string.IsNullOrWhiteSpace(customerEmail))
                throw new ArgumentException("Customer email address is not available. Please provide a valid email address.");

            // Revoke any previous pending links for this quotation to prevent conflicting responses
            var existingPending = await _responseRepository.FindByCondition(
                r => r.QuotationId == quotationId && !r.IsRevoked && r.ResponseStatus == "Pending");
            foreach (var old in existingPending)
            {
                old.IsRevoked = true;
                await _responseRepository.Update(old);
            }

            var expiryDays = dto?.ExpiryDays is > 0 ? dto.ExpiryDays.Value : 15;
            var expiresAt = quotation.ValidUntil.HasValue && quotation.ValidUntil.Value > DateTime.UtcNow
                ? quotation.ValidUntil.Value
                : DateTime.UtcNow.AddDays(expiryDays);

            var responseEntity = new QuotationCustomerResponse
            {
                QuotationId = quotation.QuotationId,
                CustomerEmail = customerEmail,
                PublicResponseId = Guid.NewGuid(),
                RevisionNumber = quotation.RevisionNumber,
                ResponseStatus = "Pending",
                CreatedAt = DateTime.UtcNow,
                EmailSentAt = DateTime.UtcNow,
                ExpiresAt = expiresAt,
                IsRevoked = false,
            };

            await _responseRepository.Create(responseEntity);

            var profiles = await _companyProfileRepository.GetAll();
            var profile = profiles.FirstOrDefault(p => !p.IsDeleted && p.IsActive && p.IsDefault)
                ?? profiles.FirstOrDefault(p => !p.IsDeleted && p.IsActive);

            var companyName = profile?.CompanyName ?? "iSquare";
            var customerDisplayName = !string.IsNullOrWhiteSpace(customer?.CompanyName)
                ? customer.CompanyName
                : (!string.IsNullOrWhiteSpace(customer?.CustomerName) ? customer.CustomerName : "Valued Customer");

            var publicUrl = BuildPublicUrl(responseEntity.PublicResponseId);
            var acceptUrl = $"{publicUrl}?action=accept";
            var rejectUrl = $"{publicUrl}?action=reject";

            var subject = !string.IsNullOrWhiteSpace(dto?.Subject)
                ? dto.Subject.Trim()
                : $"Commercial Quotation {quotation.QuotationNumber} (Rev {quotation.RevisionNumber}) from {companyName}";

            var items = (await _quotationItemService.GetByQuotationIdAsync(quotation.QuotationId))
                .Where(i => !i.IsDeleted)
                .OrderBy(i => i.DisplayOrder)
                .ToList();
            var charges = (await _quotationChargeService.GetByQuotationIdAsync(quotation.QuotationId))
                .ToList();

            var customerAddresses = customer != null
                ? await _companyAddressRepository.FindByCondition(a => a.CompanyId == customer.CompanyId && !a.IsDeleted)
                : Enumerable.Empty<CompanyAddressEntity>();
            var primaryAddress = customerAddresses
                .OrderByDescending(a => a.IsPrimary)
                .ThenByDescending(a => a.IsBilling)
                .FirstOrDefault();
            var customerAddressText = primaryAddress != null
                ? string.Join(", ", new[] { primaryAddress.Address, primaryAddress.Pincode }.Where(s => !string.IsNullOrWhiteSpace(s)))
                : "N/A";

            var companyAddressText = profile == null
                ? string.Empty
                : string.Join(", ", new[] { profile.Address, profile.City, profile.State, profile.PINCode, profile.Country }
                    .Where(s => !string.IsNullOrWhiteSpace(s)));

            var formattedSubtotal = quotation.Subtotal.ToString("N2", CultureInfo.InvariantCulture);
            var formattedDiscount = quotation.DiscountAmount.ToString("N2", CultureInfo.InvariantCulture);
            var formattedTaxable = quotation.TaxableAmount.ToString("N2", CultureInfo.InvariantCulture);
            var formattedTax = quotation.TaxAmount.ToString("N2", CultureInfo.InvariantCulture);
            var formattedTotal = quotation.GrandTotal.ToString("N2", CultureInfo.InvariantCulture);
            var validUntilStr = quotation.ValidUntil.HasValue
                ? quotation.ValidUntil.Value.ToString("dd MMM yyyy", CultureInfo.InvariantCulture)
                : expiresAt.ToString("dd MMM yyyy", CultureInfo.InvariantCulture);
            var quoteDateStr = quotation.QuotationDate.ToString("dd MMM yyyy", CultureInfo.InvariantCulture);

            var itemsRowsHtml = new StringBuilder();
            if (items.Count == 0)
            {
                itemsRowsHtml.Append(@"<tr><td colspan=""7"" style=""padding:20px 14px;text-align:center;color:#94a3b8;font-size:12px;"">No items listed.</td></tr>");
            }
            else
            {
                for (int idx = 0; idx < items.Count; idx++)
                {
                    var item = items[idx];
                    var borderBottom = idx < items.Count - 1 || charges.Count > 0 ? "border-bottom:1px solid #f1f5f9;" : string.Empty;
                    var specHtml = !string.IsNullOrWhiteSpace(item.Specification)
                        ? $"<div style=\"font-size:11px;color:#64748b;margin-top:2px;line-height:1.4;\">{WebUtility.HtmlEncode(item.Specification).Replace("\n", "<br/>")}</div>"
                        : string.Empty;
                    var brandHtml = !string.IsNullOrWhiteSpace(item.Brand)
                        ? $"<div style=\"font-size:11px;color:#64748b;margin-top:2px;\">Brand: {WebUtility.HtmlEncode(item.Brand)}</div>"
                        : string.Empty;

                    itemsRowsHtml.Append($@"
                    <tr>
                      <td style=""padding:12px 14px;{borderBottom}font-size:12px;color:#64748b;vertical-align:top;"">{idx + 1}</td>
                      <td style=""padding:12px 14px;{borderBottom}font-size:12px;color:#052B50;vertical-align:top;"">
                        <div style=""font-weight:700;color:#052B50;"">{WebUtility.HtmlEncode(item.ItemName)}</div>{brandHtml}{specHtml}
                      </td>
                      <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;white-space:nowrap;"">{item.Quantity:0.###}</td>
                      <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;white-space:nowrap;"">&#8377;{item.Rate:N2}</td>
                      <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;white-space:nowrap;"">{item.DiscountPercentage:0.##}%</td>
                      <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;white-space:nowrap;"">{item.GSTRate:0.##}%</td>
                      <td style=""padding:12px 14px;{borderBottom}text-align:right;font-size:12px;font-weight:700;color:#052B50;vertical-align:top;white-space:nowrap;"">&#8377;{item.LineTotal:N2}</td>
                    </tr>");
                }
            }

            for (int cIdx = 0; cIdx < charges.Count; cIdx++)
            {
                var ch = charges[cIdx];
                var borderBottom = cIdx < charges.Count - 1 ? "border-bottom:1px solid #f1f5f9;" : string.Empty;
                itemsRowsHtml.Append($@"
                <tr>
                  <td style=""padding:12px 14px;{borderBottom}font-size:12px;color:#64748b;vertical-align:top;"">+</td>
                  <td style=""padding:12px 14px;{borderBottom}font-size:12px;font-weight:700;color:#052B50;vertical-align:top;"">{WebUtility.HtmlEncode(ch.ChargeName)}</td>
                  <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;"">1</td>
                  <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;white-space:nowrap;"">&#8377;{ch.ChargeAmount:N2}</td>
                  <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;"">0%</td>
                  <td style=""padding:12px 10px;{borderBottom}text-align:right;font-size:12px;color:#172B4D;vertical-align:top;"">{ch.TaxRate:0.##}%</td>
                  <td style=""padding:12px 14px;{borderBottom}text-align:right;font-size:12px;font-weight:700;color:#052B50;vertical-align:top;white-space:nowrap;"">&#8377;{ch.TotalAmount:N2}</td>
                </tr>");
            }

            var chargesSummaryRows = new StringBuilder();
            if (quotation.FreightCharges > 0)
                chargesSummaryRows.Append($@"<tr><td style=""padding:4px 0;font-size:12px;color:#475569;"">Freight Charges</td><td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{quotation.FreightCharges:N2}</td></tr>");
            if (quotation.InstallationCharges > 0)
                chargesSummaryRows.Append($@"<tr><td style=""padding:4px 0;font-size:12px;color:#475569;"">Installation Charges</td><td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{quotation.InstallationCharges:N2}</td></tr>");
            if (quotation.OtherCharges > 0)
                chargesSummaryRows.Append($@"<tr><td style=""padding:4px 0;font-size:12px;color:#475569;"">Other Charges</td><td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{quotation.OtherCharges:N2}</td></tr>");

            var termsHtml = !string.IsNullOrWhiteSpace(quotation.TermsAndConditions)
                ? WebUtility.HtmlEncode(quotation.TermsAndConditions.Trim()).Replace("\n", "<br/>")
                : "1. Taxes extra as applicable.<br/>2. Prices firm for validity period.";

            var customMessageHtml = !string.IsNullOrWhiteSpace(dto?.Message)
                ? $@"<div style=""margin:0 0 16px;padding:12px 16px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:10px;color:#334155;font-size:13px;line-height:1.5;"">{WebUtility.HtmlEncode(dto.Message.Trim()).Replace("\n", "<br/>")}</div>"
                : string.Empty;

            var logoUrl = !string.IsNullOrWhiteSpace(profile?.LogoPath) && profile.LogoPath.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? profile.LogoPath
                : string.Empty;
            var logoHtml = !string.IsNullOrEmpty(logoUrl)
                ? $"<img src=\"{WebUtility.HtmlEncode(logoUrl)}\" alt=\"{WebUtility.HtmlEncode(companyName)}\" style=\"max-height:36px;max-width:140px;display:block;margin-bottom:6px;\" />"
                : string.Empty;

            var customerGstin = customer?.GSTIN ?? customer?.GSTNumber;

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8"" /><meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" /></head>
<body style=""margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#172B4D;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f1f5f9;padding:24px 12px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""780"" cellpadding=""0"" cellspacing=""0"" style=""max-width:780px;width:100%;"">
          <tr>
            <td>
              {customMessageHtml}

              <!-- Quotation Preview Card (Matches Public Quotation Preview UI) -->
              <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;border-collapse:separate;"">
                <!-- Navy Brand Header -->
                <tr>
                  <td style=""background-color:#052B50;padding:24px 28px;color:#ffffff;"">
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                      <tr>
                        <td style=""vertical-align:middle;"">
                          {logoHtml}
                          <div style=""font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;"">{WebUtility.HtmlEncode(companyName)}</div>
                          {(string.IsNullOrWhiteSpace(companyAddressText) ? "" : $"<div style=\"font-size:11px;color:#cbd5e1;margin-top:4px;line-height:1.4;\">{WebUtility.HtmlEncode(companyAddressText)}</div>")}
                          {(string.IsNullOrWhiteSpace(profile?.GSTIN) && string.IsNullOrWhiteSpace(profile?.Email) && string.IsNullOrWhiteSpace(profile?.Phone) ? "" : $@"
                          <div style=""font-size:11px;color:#cbd5e1;margin-top:4px;"">
                            {(string.IsNullOrWhiteSpace(profile?.GSTIN) ? "" : $"GSTIN: {WebUtility.HtmlEncode(profile.GSTIN)} &nbsp;&bull;&nbsp; ")}
                            {(string.IsNullOrWhiteSpace(profile?.Email) ? "" : $"Email: {WebUtility.HtmlEncode(profile.Email)} &nbsp;&bull;&nbsp; ")}
                            {(string.IsNullOrWhiteSpace(profile?.Phone) ? "" : $"Phone: {WebUtility.HtmlEncode(profile.Phone)}")}
                          </div>")}
                        </td>
                        <td style=""vertical-align:middle;text-align:right;"">
                          <span style=""display:inline-block;background-color:#FF7900;color:#ffffff;font-size:10px;font-weight:700;padding:5px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:0.06em;"">COMMERCIAL QUOTATION</span>
                          <div style=""font-size:18px;font-weight:700;color:#ffffff;margin-top:8px;"">{WebUtility.HtmlEncode(quotation.QuotationNumber)} (R{quotation.RevisionNumber})</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body -->
                <tr>
                  <td style=""padding:24px 28px;"">
                    <!-- Prepared For & Dates Card -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;margin-bottom:20px;"">
                      <tr>
                        <td width=""52%"" style=""padding:16px 18px;vertical-align:top;"">
                          <div style=""font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:6px;"">PREPARED FOR</div>
                          <div style=""font-size:14px;font-weight:700;color:#052B50;margin-bottom:4px;"">{WebUtility.HtmlEncode(customerDisplayName)}</div>
                          <div style=""font-size:12px;color:#475569;line-height:1.5;"">{WebUtility.HtmlEncode(customerEmail)}</div>
                          {(string.IsNullOrWhiteSpace(customer?.Mobile) ? "" : $"<div style=\"font-size:12px;color:#475569;line-height:1.5;\">Phone: {WebUtility.HtmlEncode(customer.Mobile)}</div>")}
                          {(string.IsNullOrWhiteSpace(customerGstin) ? "" : $"<div style=\"font-size:12px;color:#475569;line-height:1.5;\">GSTIN: {WebUtility.HtmlEncode(customerGstin)}</div>")}
                          {(string.IsNullOrWhiteSpace(customerAddressText) || customerAddressText == "N/A" ? "" : $"<div style=\"font-size:11px;color:#64748b;line-height:1.4;margin-top:4px;\">{WebUtility.HtmlEncode(customerAddressText)}</div>")}
                        </td>
                        <td width=""48%"" style=""padding:16px 18px;vertical-align:top;"">
                          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                            <tr>
                              <td width=""50%"" style=""vertical-align:top;padding-bottom:12px;"">
                                <div style=""font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;"">DATE</div>
                                <div style=""font-size:12px;font-weight:600;color:#052B50;margin-top:3px;"">{quoteDateStr}</div>
                              </td>
                              <td width=""50%"" style=""vertical-align:top;padding-bottom:12px;"">
                                <div style=""font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;"">VALID UNTIL</div>
                                <div style=""font-size:12px;font-weight:600;color:#052B50;margin-top:3px;"">{validUntilStr}</div>
                              </td>
                            </tr>
                            {(string.IsNullOrWhiteSpace(quotation.DeliveryPeriod) && string.IsNullOrWhiteSpace(quotation.Warranty) ? "" : $@"
                            <tr>
                              <td width=""50%"" style=""vertical-align:top;"">
                                {(string.IsNullOrWhiteSpace(quotation.DeliveryPeriod) ? "" : $"<div style=\"font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;\">DELIVERY</div><div style=\"font-size:12px;font-weight:600;color:#334155;margin-top:3px;\">{WebUtility.HtmlEncode(quotation.DeliveryPeriod)}</div>")}
                              </td>
                              <td width=""50%"" style=""vertical-align:top;"">
                                {(string.IsNullOrWhiteSpace(quotation.Warranty) ? "" : $"<div style=\"font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;\">WARRANTY</div><div style=\"font-size:12px;font-weight:600;color:#334155;margin-top:3px;\">{WebUtility.HtmlEncode(quotation.Warranty)}</div>")}
                              </td>
                            </tr>")}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Line Items Table -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;border-collapse:separate;margin-bottom:20px;"">
                      <thead>
                        <tr style=""background-color:#f1f5f9;"">
                          <th style=""padding:11px 14px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:left;width:36px;"">#</th>
                          <th style=""padding:11px 14px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:left;"">ITEM DESCRIPTION</th>
                          <th style=""padding:11px 10px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:right;width:54px;"">QTY</th>
                          <th style=""padding:11px 10px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:right;width:90px;"">RATE</th>
                          <th style=""padding:11px 10px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:right;width:62px;"">DISC %</th>
                          <th style=""padding:11px 10px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:right;width:62px;"">GST %</th>
                          <th style=""padding:11px 14px;border-bottom:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;text-align:right;width:105px;"">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsRowsHtml}
                      </tbody>
                    </table>

                    <!-- Terms & Conditions + Financial Summary -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;"">
                      <tr>
                        <td width=""56%"" style=""vertical-align:top;padding-right:16px;"">
                          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;"">
                            <tr>
                              <td style=""padding:14px 16px;"">
                                <div style=""font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#FF7900;margin-bottom:6px;"">TERMS &amp; CONDITIONS</div>
                                <div style=""font-size:12px;color:#475569;line-height:1.6;"">{termsHtml}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width=""44%"" style=""vertical-align:top;"">
                          <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;"">
                            <tr>
                              <td style=""padding:14px 16px;"">
                                <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                  <tr>
                                    <td style=""padding:4px 0;font-size:12px;color:#475569;"">Subtotal</td>
                                    <td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{formattedSubtotal}</td>
                                  </tr>
                                  {(quotation.DiscountAmount > 0 ? $@"
                                  <tr>
                                    <td style=""padding:4px 0;font-size:12px;color:#047857;"">Discount</td>
                                    <td style=""padding:4px 0;font-size:12px;font-weight:600;color:#047857;text-align:right;"">- &#8377;{formattedDiscount}</td>
                                  </tr>" : "")}
                                  <tr>
                                    <td style=""padding:4px 0;font-size:12px;color:#475569;"">Taxable Amount</td>
                                    <td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{formattedTaxable}</td>
                                  </tr>
                                  <tr>
                                    <td style=""padding:4px 0;font-size:12px;color:#475569;"">GST / Tax</td>
                                    <td style=""padding:4px 0;font-size:12px;font-weight:600;color:#172B4D;text-align:right;"">&#8377;{formattedTax}</td>
                                  </tr>
                                  {chargesSummaryRows}
                                  <tr>
                                    <td colspan=""2"" style=""padding-top:10px;border-top:1px solid #e2e8f0;"">
                                      <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                        <tr>
                                          <td style=""font-size:15px;font-weight:700;color:#052B50;"">Grand Total</td>
                                          <td style=""font-size:16px;font-weight:700;color:#FF7900;text-align:right;"">&#8377;{formattedTotal}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Accept / Reject Action Buttons -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-top:24px;border-top:1px solid #e2e8f0;padding-top:20px;"">
                      <tr>
                        <td align=""center"">
                          <a href=""{WebUtility.HtmlEncode(acceptUrl)}"" style=""display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;margin:4px 6px;"">
                            &#10003;&nbsp; Accept Quotation
                          </a>
                          <a href=""{WebUtility.HtmlEncode(rejectUrl)}"" style=""display:inline-block;background-color:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;margin:4px 6px;"">
                            &#10005;&nbsp; Reject Quotation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await _emailService.SendEmailAsync(customerEmail, subject, htmlBody);

            // Update quotation status to Sent if it is Draft, Approved, or Revised
            var currentStatus = (quotation.Status ?? string.Empty).Trim();
            if (currentStatus.Equals("Draft", StringComparison.OrdinalIgnoreCase) ||
                currentStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
                currentStatus.Equals("Revised", StringComparison.OrdinalIgnoreCase))
            {
                await _quotationService.UpdateStatusAsync(quotation.QuotationId, "Sent");
            }

            _logger.LogInformation(
                "Quotation {QuotationId} email sent to {Email} with PublicResponseId {PublicResponseId}",
                quotationId, customerEmail, responseEntity.PublicResponseId);

            return MapToDto(responseEntity, publicUrl);
        }

        public async Task<IEnumerable<QuotationCustomerResponseDto>> GetAllResponsesAsync()
        {
            var responses = await _responseRepository.GetAll();
            return responses
                .OrderByDescending(r => r.CreatedAt)
                .ThenByDescending(r => r.QuotationCustomerResponseId)
                .Select(r => MapToDto(r, BuildPublicUrl(r.PublicResponseId)))
                .ToList();
        }

        public async Task<IEnumerable<QuotationCustomerResponseDto>> GetResponsesByQuotationIdAsync(int quotationId)
        {
            var responses = await _responseRepository.FindByCondition(r => r.QuotationId == quotationId);
            return responses
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapToDto(r, BuildPublicUrl(r.PublicResponseId)))
                .ToList();
        }

        public async Task<PublicQuotationResponseDto?> GetPublicQuotationAsync(Guid publicResponseId)
        {
            var responses = await _responseRepository.FindByCondition(r => r.PublicResponseId == publicResponseId);
            var responseEntity = responses.FirstOrDefault();
            if (responseEntity == null)
                return null;

            var quotation = await _quotationRepository.GetByIdAsync(responseEntity.QuotationId);
            if (quotation == null || quotation.IsDeleted)
                return null;

            var isExpired = responseEntity.ExpiresAt < DateTime.UtcNow;
            var customer = quotation.CustomerId > 0
                ? await _companyRepository.GetByIdAsync(quotation.CustomerId)
                : null;

            var profiles = await _companyProfileRepository.GetAll();
            var profile = profiles.FirstOrDefault(p => !p.IsDeleted && p.IsActive && p.IsDefault)
                ?? profiles.FirstOrDefault(p => !p.IsDeleted && p.IsActive);

            var items = (await _quotationItemService.GetByQuotationIdAsync(quotation.QuotationId)).ToList();
            var charges = (await _quotationChargeService.GetByQuotationIdAsync(quotation.QuotationId)).ToList();

            var companyAddress = profile == null
                ? null
                : string.Join(", ", new[] { profile.Address, profile.City, profile.State, profile.PINCode, profile.Country }
                    .Where(s => !string.IsNullOrWhiteSpace(s)));

            return new PublicQuotationResponseDto
            {
                PublicResponseId = responseEntity.PublicResponseId,
                QuotationId = quotation.QuotationId,
                QuotationNumber = quotation.QuotationNumber,
                QuotationDate = quotation.QuotationDate,
                ValidUntil = quotation.ValidUntil,
                RevisionNumber = quotation.RevisionNumber,
                QuotationStatus = quotation.Status,
                ResponseStatus = responseEntity.ResponseStatus,
                CustomerEmail = responseEntity.CustomerEmail,
                EmailSentAt = responseEntity.EmailSentAt,
                ExpiresAt = responseEntity.ExpiresAt,
                RespondedAt = responseEntity.RespondedAt,
                CustomerRemarks = responseEntity.CustomerRemarks,
                IsExpired = isExpired,
                IsRevoked = responseEntity.IsRevoked,
                CustomerId = quotation.CustomerId,
                CustomerName = !string.IsNullOrWhiteSpace(customer?.CompanyName)
                    ? customer.CompanyName
                    : (!string.IsNullOrWhiteSpace(customer?.CustomerName) ? customer.CustomerName : $"Customer #{quotation.CustomerId}"),
                CustomerPhone = customer?.Mobile ?? customer?.AlternateMobile,
                CustomerGstin = customer?.GSTIN ?? customer?.GSTNumber,
                CompanyName = profile?.CompanyName ?? "iSquare",
                CompanyLegalName = profile?.LegalName,
                CompanyAddress = companyAddress,
                CompanyEmail = profile?.Email,
                CompanyPhone = profile?.Phone,
                CompanyGstin = profile?.GSTIN,
                CompanyLogoPath = profile?.LogoPath,
                Subtotal = quotation.Subtotal,
                DiscountAmount = quotation.DiscountAmount,
                TaxableAmount = quotation.TaxableAmount,
                TaxAmount = quotation.TaxAmount,
                FreightCharges = quotation.FreightCharges,
                InstallationCharges = quotation.InstallationCharges,
                OtherCharges = quotation.OtherCharges,
                GrandTotal = quotation.GrandTotal,
                DeliveryPeriod = quotation.DeliveryPeriod,
                Warranty = quotation.Warranty,
                TermsAndConditions = quotation.TermsAndConditions,
                Items = items,
                Charges = charges,
            };
        }

        public async Task<QuotationCustomerResponseDto> SubmitCustomerDecisionAsync(
            Guid publicResponseId,
            QuotationCustomerDecisionDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Decision))
                throw new ArgumentException("Decision is required.");

            var trimmedDecision = dto.Decision.Trim();
            string normalizedDecision;
            if (trimmedDecision.Equals("Accepted", StringComparison.OrdinalIgnoreCase) ||
                trimmedDecision.Equals("Accept", StringComparison.OrdinalIgnoreCase))
            {
                normalizedDecision = "Accepted";
            }
            else if (trimmedDecision.Equals("Rejected", StringComparison.OrdinalIgnoreCase) ||
                     trimmedDecision.Equals("Reject", StringComparison.OrdinalIgnoreCase))
            {
                normalizedDecision = "Rejected";
            }
            else
            {
                throw new ArgumentException("Decision must be either 'Accepted' or 'Rejected'.");
            }

            var responses = await _responseRepository.FindByCondition(r => r.PublicResponseId == publicResponseId);
            var responseEntity = responses.FirstOrDefault();
            if (responseEntity == null)
                throw new KeyNotFoundException("Invalid or unknown quotation response link.");

            if (responseEntity.IsRevoked)
                throw new InvalidOperationException("This quotation link has been revoked because a newer version was issued.");

            if (responseEntity.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("This quotation link has expired.");

            if (!responseEntity.ResponseStatus.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException($"This quotation has already been {responseEntity.ResponseStatus}.");

            responseEntity.ResponseStatus = normalizedDecision;
            responseEntity.RespondedAt = DateTime.UtcNow;
            responseEntity.CustomerRemarks = string.IsNullOrWhiteSpace(dto.CustomerRemarks)
                ? null
                : dto.CustomerRemarks.Trim();

            await _responseRepository.Update(responseEntity);

            // Dynamically update quotation status without touching internal approval records
            var newQuotationStatus = normalizedDecision == "Accepted" ? "Won" : "Lost";
            await _quotationService.UpdateStatusAsync(responseEntity.QuotationId, newQuotationStatus);

            _logger.LogInformation(
                "Customer responded {Decision} for Quotation {QuotationId} (PublicResponseId: {PublicResponseId})",
                normalizedDecision, responseEntity.QuotationId, publicResponseId);

            return MapToDto(responseEntity, BuildPublicUrl(responseEntity.PublicResponseId));
        }

        private static QuotationCustomerResponseDto MapToDto(QuotationCustomerResponse entity, string? publicUrl)
        {
            return new QuotationCustomerResponseDto
            {
                QuotationCustomerResponseId = entity.QuotationCustomerResponseId,
                QuotationId = entity.QuotationId,
                CustomerEmail = entity.CustomerEmail,
                PublicResponseId = entity.PublicResponseId,
                RevisionNumber = entity.RevisionNumber,
                ResponseStatus = entity.ResponseStatus,
                CreatedAt = entity.CreatedAt,
                EmailSentAt = entity.EmailSentAt,
                ExpiresAt = entity.ExpiresAt,
                RespondedAt = entity.RespondedAt,
                CustomerRemarks = entity.CustomerRemarks,
                IsRevoked = entity.IsRevoked,
                PublicUrl = publicUrl,
            };
        }
    }
}
