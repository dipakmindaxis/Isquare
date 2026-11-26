using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.CRM.DTO.Quotation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QuotationModel = CompanyPlatform.Core.Models.CRM.Quotation;
using CompanyEntity = CompanyPlatform.Core.Models.CRM.Company;
using CompanyAddressEntity = CompanyPlatform.Core.Models.CRM.CompanyAddress;
using CompanyEmailEntity = CompanyPlatform.Core.Models.CRM.CompanyEmail;
using CompanyContactEntity = CompanyPlatform.Core.Models.CRM.CompanyContact;
using CompanyProfileEntity = CompanyPlatform.Core.Models.CRM.CompanyProfile;
using ProductEntity = CompanyPlatform.Core.Models.CRM.Product;

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
        private readonly IRepositories<ProductEntity> _productRepository;
        private readonly IQuotationService _quotationService;
        private readonly IQuotationItemService _quotationItemService;
        private readonly IQuotationChargeService _quotationChargeService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ILogger<QuotationCustomerResponseService> _logger;

        public QuotationCustomerResponseService(
            IRepositories<QuotationCustomerResponse> responseRepository,
            IRepositories<QuotationModel> quotationRepository,
            IRepositories<CompanyEntity> companyRepository,
            IRepositories<CompanyAddressEntity> companyAddressRepository,
            IRepositories<CompanyEmailEntity> companyEmailRepository,
            IRepositories<CompanyContactEntity> companyContactRepository,
            IRepositories<CompanyProfileEntity> companyProfileRepository,
            IRepositories<ProductEntity> productRepository,
            IQuotationService quotationService,
            IQuotationItemService quotationItemService,
            IQuotationChargeService quotationChargeService,
            IEmailService emailService,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment webHostEnvironment,
            ILogger<QuotationCustomerResponseService> logger)
        {
            _responseRepository = responseRepository;
            _quotationRepository = quotationRepository;
            _companyRepository = companyRepository;
            _companyAddressRepository = companyAddressRepository;
            _companyEmailRepository = companyEmailRepository;
            _companyContactRepository = companyContactRepository;
            _companyProfileRepository = companyProfileRepository;
            _productRepository = productRepository;
            _quotationService = quotationService;
            _quotationItemService = quotationItemService;
            _quotationChargeService = quotationChargeService;
            _emailService = emailService;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _webHostEnvironment = webHostEnvironment;
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

            var productIds = items
                .Where(i => i.ProductId.HasValue)
                .Select(i => i.ProductId!.Value)
                .Distinct()
                .ToList();
            var productMap = new Dictionary<int, ProductEntity>();
            if (productIds.Count > 0)
            {
                var products = await _productRepository.FindByCondition(p => productIds.Contains(p.ProductId));
                foreach (var prod in products)
                {
                    productMap[prod.ProductId] = prod;
                }
            }

            var inlineImages = new List<EmailInlineImage>();

            string GetMimeType(string filePath)
            {
                var ext = Path.GetExtension(filePath).ToLowerInvariant();
                return ext switch
                {
                    ".png" => "image/png",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    _ => "image/png",
                };
            }

            string? TryResolveLocalFile(string? pathCandidate)
            {
                if (string.IsNullOrWhiteSpace(pathCandidate))
                    return null;

                var webRoot = !string.IsNullOrWhiteSpace(_webHostEnvironment.WebRootPath)
                    ? _webHostEnvironment.WebRootPath
                    : Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");

                var cleaned = pathCandidate.Replace('\\', '/').Trim();
                if (Uri.TryCreate(cleaned, UriKind.Absolute, out var absUri))
                    cleaned = absUri.AbsolutePath;

                cleaned = cleaned.TrimStart('/');
                if (cleaned.StartsWith("api/", StringComparison.OrdinalIgnoreCase))
                    cleaned = cleaned.Substring(4);

                var candidate1 = Path.Combine(webRoot, cleaned.Replace('/', Path.DirectorySeparatorChar));
                if (File.Exists(candidate1))
                    return candidate1;

                var fileName = Path.GetFileName(cleaned);
                if (!string.IsNullOrWhiteSpace(fileName))
                {
                    var candidate2 = Path.Combine(webRoot, "Uploads", "products", fileName);
                    if (File.Exists(candidate2))
                        return candidate2;
                }

                return null;
            }

            bool TryAttachInlineImage(string contentId, string? pathCandidate)
            {
                var resolved = TryResolveLocalFile(pathCandidate);
                if (string.IsNullOrEmpty(resolved))
                    return false;

                var bytes = File.ReadAllBytes(resolved);
                if (bytes.Length == 0)
                    return false;

                inlineImages.Add(new EmailInlineImage(contentId, bytes, GetMimeType(resolved), Path.GetFileName(resolved)));
                return true;
            }

            var itemsRowsHtml = new StringBuilder();
            if (items.Count == 0)
            {
                itemsRowsHtml.Append(@"<tr><td colspan=""10"" style=""padding:24px 12px;text-align:center;color:#94a3b8;font-size:12px;"">No products added to this quotation.</td></tr>");
            }
            else
            {
                for (int idx = 0; idx < items.Count; idx++)
                {
                    var item = items[idx];
                    ProductEntity? prod = null;
                    if (item.ProductId.HasValue)
                        productMap.TryGetValue(item.ProductId.Value, out prod);

                    var hsnCode = !string.IsNullOrWhiteSpace(prod?.HsnCode) ? prod.HsnCode : "—";
                    var rawImg = prod?.ProductImage;
                    var productCid = $"product-{idx}";
                    string? imgSrc = null;
                    if (!string.IsNullOrWhiteSpace(rawImg))
                    {
                        if (TryAttachInlineImage(productCid, rawImg))
                        {
                            imgSrc = $"cid:{productCid}";
                        }
                        else if (rawImg.StartsWith("http", StringComparison.OrdinalIgnoreCase) && !IsLocalhostUrl(rawImg))
                        {
                            imgSrc = rawImg;
                        }
                    }

                    var imageCellHtml = !string.IsNullOrEmpty(imgSrc)
                        ? $@"<img src=""{WebUtility.HtmlEncode(imgSrc)}"" alt=""{WebUtility.HtmlEncode(item.ItemName)}"" style=""max-height:54px;max-width:54px;display:block;margin:0 auto;border-radius:4px;"" />"
                        : @"<div style=""width:48px;height:48px;margin:0 auto;border:1px solid #e2e8f0;background-color:#f8fafc;border-radius:6px;line-height:48px;font-size:9px;color:#94a3b8;text-align:center;"">No Image</div>";

                    var specBulletsHtml = new StringBuilder();
                    if (!string.IsNullOrWhiteSpace(item.Specification))
                    {
                        var lines = item.Specification
                            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(l => l.Trim())
                            .Where(l => !string.IsNullOrEmpty(l));
                        foreach (var line in lines)
                        {
                            specBulletsHtml.Append($@"<div style=""font-size:10px;color:#475569;margin-top:2px;line-height:1.35;""><span style=""color:#FF7900;font-weight:700;"">&#8226;</span>&nbsp;{WebUtility.HtmlEncode(line)}</div>");
                        }
                    }

                    var titleText = WebUtility.HtmlEncode(item.ItemName) +
                        (!string.IsNullOrWhiteSpace(item.Brand) ? $" ({WebUtility.HtmlEncode(item.Brand)})" : string.Empty);

                    itemsRowsHtml.Append($@"
                    <tr style=""background-color:#ffffff;"">
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#334155;vertical-align:middle;"">{idx + 1}</td>
                      <td style=""padding:10px 8px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;vertical-align:middle;"">
                        <div style=""font-size:12px;font-weight:700;color:#00234a;line-height:1.3;"">{titleText}</div>
                        {specBulletsHtml}
                      </td>
                      <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;vertical-align:middle;"">{imageCellHtml}</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#334155;vertical-align:middle;"">{WebUtility.HtmlEncode(hsnCode)}</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#2563eb;vertical-align:middle;"">{item.GSTRate:0.##}%</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#1e293b;vertical-align:middle;"">{item.Quantity:0.###}</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#475569;vertical-align:middle;"">Nos</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#1e293b;vertical-align:middle;white-space:nowrap;"">&#8377;{item.Rate:N2}</td>
                      <td style=""padding:10px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#334155;vertical-align:middle;"">{item.DiscountPercentage:0.##}%</td>
                      <td style=""padding:10px 10px;border-bottom:1px solid #cbd5e1;text-align:right;font-size:12px;font-weight:700;color:#0f172a;vertical-align:middle;white-space:nowrap;"">&#8377;{item.LineTotal:N2}</td>
                    </tr>");
                }
            }

            foreach (var ch in charges)
            {
                itemsRowsHtml.Append($@"
                <tr style=""background-color:#f8fafc;"">
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#64748b;"">+</td>
                  <td colspan=""3"" style=""padding:8px 8px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;font-size:11px;font-weight:700;color:#00234a;"">{WebUtility.HtmlEncode(ch.ChargeName)}</td>
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:600;color:#2563eb;"">{ch.TaxRate:0.##}%</td>
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#1e293b;"">1</td>
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#475569;"">—</td>
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#1e293b;white-space:nowrap;"">&#8377;{ch.ChargeAmount:N2}</td>
                  <td style=""padding:8px 6px;border-bottom:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font-size:11px;color:#334155;"">0%</td>
                  <td style=""padding:8px 10px;border-bottom:1px solid #cbd5e1;text-align:right;font-size:12px;font-weight:700;color:#0f172a;white-space:nowrap;"">&#8377;{ch.TotalAmount:N2}</td>
                </tr>");
            }

            var itemsLineSum = items.Sum(i => i.LineTotal);
            var formattedItemsSubTotal = itemsLineSum.ToString("N2", CultureInfo.InvariantCulture);

            var rawTerms = !string.IsNullOrWhiteSpace(quotation.TermsAndConditions)
                ? quotation.TermsAndConditions
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => System.Text.RegularExpressions.Regex.Replace(l.Trim(), @"^\d+[\.\)]\s*", string.Empty))
                    .Where(l => !string.IsNullOrWhiteSpace(l))
                    .ToList()
                : new List<string>
                {
                    "Taxes extra as applicable.",
                    "Prices firm for validity period.",
                    "Goods once sold will not be taken back.",
                    "Subject to Pune Jurisdiction."
                };

            var termsRowsHtml = new StringBuilder();
            for (int tIdx = 0; tIdx < rawTerms.Count; tIdx++)
            {
                termsRowsHtml.Append($@"
                <tr>
                  <td width=""26"" style=""padding:3px 8px 3px 0;vertical-align:middle;"">
                    <div style=""width:18px;height:18px;line-height:18px;border-radius:50%;border:2px solid #FF7900;color:#FF7900;font-size:10px;font-weight:700;text-align:center;"">{tIdx + 1}</div>
                  </td>
                  <td style=""padding:3px 0;font-size:11px;color:#102A50;vertical-align:middle;line-height:1.4;"">{WebUtility.HtmlEncode(rawTerms[tIdx])}</td>
                </tr>");
            }

            var showCustomMsg = !string.IsNullOrWhiteSpace(dto?.Message) &&
                !dto.Message.Contains("using the link below", StringComparison.OrdinalIgnoreCase);
            var customMessageHtml = showCustomMsg
                ? $@"<div style=""margin:0 0 14px;padding:10px 14px;background-color:#ffffff;border:1px solid #D6E0EC;border-radius:8px;color:#102A50;font-size:12px;line-height:1.5;"">{WebUtility.HtmlEncode(dto!.Message!.Trim()).Replace("\n", "<br/>")}</div>"
                : string.Empty;

            var hasLogoCid = TryAttachInlineImage("isquare-logo", "Templates/isquare-logo.png")
                || TryAttachInlineImage("isquare-logo", profile?.LogoPath);
            var logoUrl = !hasLogoCid && !string.IsNullOrWhiteSpace(profile?.LogoPath) && profile.LogoPath.StartsWith("http", StringComparison.OrdinalIgnoreCase) && !IsLocalhostUrl(profile.LogoPath)
                ? profile.LogoPath
                : string.Empty;
            var brandLogoHtml = hasLogoCid
                ? $@"<img src=""cid:isquare-logo"" alt=""{WebUtility.HtmlEncode(companyName)}"" style=""max-height:54px;max-width:210px;display:block;"" />"
                : (!string.IsNullOrEmpty(logoUrl)
                    ? $@"<img src=""{WebUtility.HtmlEncode(logoUrl)}"" alt=""{WebUtility.HtmlEncode(companyName)}"" style=""max-height:54px;max-width:210px;display:block;"" />"
                    : $@"<div>
                      <div style=""font-size:24px;font-weight:900;color:#00234a;letter-spacing:-0.02em;line-height:1;"">
                        <span style=""color:#FF5500;"">i</span>SQUARE<sup style=""font-size:11px;color:#FF5500;"">&reg;</sup>
                      </div>
                      <div style=""font-size:9px;font-weight:800;letter-spacing:0.06em;color:#00234a;text-transform:uppercase;margin-top:2px;"">SAFETY EQUIPMENTS PVT. LTD.</div>
                      <div style=""font-size:10px;color:#FF5500;font-style:italic;font-family:Georgia,serif;margin-top:1px;"">The complete safety solutions</div>
                    </div>");

            var hasStampCid = TryAttachInlineImage("isquare-stamp", "Templates/isquare-stamp.png");
            var stampHtml = hasStampCid
                ? @"<img src=""cid:isquare-stamp"" alt=""iSQUARE Company Stamp"" style=""width:84px;height:84px;display:block;"" />"
                : @"<div style=""width:78px;height:78px;border:2px solid #334e86;border-radius:50%;text-align:center;color:#334e86;font-size:8px;font-weight:700;padding-top:20px;box-sizing:border-box;"">
                      iSQUARE<br/><span style=""font-size:10px;letter-spacing:0.06em;"">PUNE</span><br/>&#9733;
                    </div>";

            var headerAddress = string.IsNullOrWhiteSpace(companyAddressText)
                ? "GOYAL RESIDENCY B, SR NO. 434/4A, OFFICE, B1/13, Kasarwadi, Maharashtra 411034"
                : companyAddressText;
            var headerPhone = string.IsNullOrWhiteSpace(profile?.Phone) ? "+91 9028815632" : profile.Phone;
            var headerEmail = string.IsNullOrWhiteSpace(profile?.Email) ? "sales@isquaresafety.com" : profile.Email;
            var headerGstin = string.IsNullOrWhiteSpace(profile?.GSTIN) ? "27AARCP3435C1ZD" : profile.GSTIN;
            var headerPan = string.IsNullOrWhiteSpace(profile?.PAN) ? "AARCP3435C" : profile.PAN;

            var grandTotalRowHtml = quotation.GrandTotal != itemsLineSum
                ? $@"
                <tr style=""background-color:#F5F8FC;border-top:1px solid #D6E0EC;"">
                  <td colspan=""9"" style=""padding:8px 10px;text-align:right;font-size:12px;font-weight:800;color:#002B55;border-right:1px solid #D6E0EC;text-transform:uppercase;"">GRAND TOTAL</td>
                  <td style=""padding:8px 10px;text-align:right;font-size:13px;font-weight:800;color:#FF7900;white-space:nowrap;"">&#8377;{formattedTotal}</td>
                </tr>"
                : string.Empty;

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8"" /><meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" /></head>
<body style=""margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#102A50;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#eef2f7;padding:20px 10px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""820"" cellpadding=""0"" cellspacing=""0"" style=""max-width:820px;width:100%;"">
          <tr>
            <td>
              {customMessageHtml}

              <!-- iSQUARE Official Quotation Sheet -->
              <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;background-color:#ffffff;border:1px solid #D6E0EC;border-radius:10px;padding:22px 24px;"">
                <tr>
                  <td>
                    <!-- 1. Company Header -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-bottom:2px solid #FF7900;padding-bottom:12px;margin-bottom:14px;"">
                      <tr>
                        <td style=""vertical-align:middle;"">
                          {brandLogoHtml}
                        </td>
                        <td style=""vertical-align:middle;text-align:right;font-size:10px;color:#64748B;line-height:1.45;"">
                          <div style=""font-size:11px;font-weight:700;color:#102A50;"">{WebUtility.HtmlEncode(headerAddress)}</div>
                          <div style=""margin-top:2px;"">
                            <span style=""font-weight:600;color:#102A50;"">Contact:</span> {WebUtility.HtmlEncode(headerPhone)} &nbsp;|&nbsp;
                            <span style=""font-weight:600;color:#102A50;"">Email:</span> {WebUtility.HtmlEncode(headerEmail)}
                          </div>
                          <div style=""font-family:'Courier New',monospace;margin-top:2px;"">
                            <span style=""font-weight:600;color:#102A50;"">GSTIN:</span> {WebUtility.HtmlEncode(headerGstin)} &nbsp;|&nbsp;
                            <span style=""font-weight:600;color:#102A50;"">PAN:</span> {WebUtility.HtmlEncode(headerPan)}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- 2. Ref & Date Strip -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#F5F8FC;border:1px solid #D6E0EC;border-radius:8px;margin-bottom:12px;"">
                      <tr>
                        <td style=""padding:8px 14px;font-size:12px;"">
                          <span style=""font-weight:700;color:#002B55;"">Ref.:</span>&nbsp;
                          <span style=""font-weight:800;color:#FF7900;font-size:13px;"">{WebUtility.HtmlEncode(quotation.QuotationNumber)}</span>
                        </td>
                        <td style=""padding:8px 14px;text-align:right;font-size:12px;"">
                          <span style=""color:#64748B;"">Date:</span>&nbsp;
                          <span style=""font-weight:700;color:#002B55;"">{quoteDateStr}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- 3. To Customer Block -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#F5F8FC;border:1px solid #D6E0EC;border-radius:10px;margin-bottom:14px;"">
                      <tr>
                        <td style=""padding:14px 16px;font-size:11px;color:#102A50;line-height:1.5;"">
                          <div style=""font-weight:700;color:#64748B;font-size:11px;"">To,</div>
                          <div style=""font-size:13px;font-weight:800;color:#002B55;text-transform:uppercase;margin-top:2px;"">{WebUtility.HtmlEncode(customerDisplayName)}</div>
                          {(string.IsNullOrWhiteSpace(customerAddressText) || customerAddressText == "N/A" ? "" : $"<div style=\"color:#64748B;margin-top:2px;\">{WebUtility.HtmlEncode(customerAddressText)}</div>")}
                          {(string.IsNullOrWhiteSpace(customer?.Mobile) ? "" : $"<div style=\"margin-top:4px;\"><span style=\"font-weight:700;color:#002B55;\">Mob. No.:</span>&nbsp;&nbsp;{WebUtility.HtmlEncode(customer.Mobile)}</div>")}
                          <div><span style=""font-weight:700;color:#002B55;"">Email id:</span>&nbsp;&nbsp;{WebUtility.HtmlEncode(customerEmail)}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- 4. Subject Pill & Salutation -->
                    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:10px;border:1px solid #fed7aa;border-radius:6px;overflow:hidden;border-collapse:separate;"">
                      <tr>
                        <td style=""background-color:#002B55;color:#ffffff;font-size:11px;font-weight:800;padding:5px 12px;letter-spacing:0.04em;"">Sub:</td>
                        <td style=""background-color:#fff7ed;color:#002B55;font-size:12px;font-weight:700;padding:5px 16px;"">Offer for PPP</td>
                      </tr>
                    </table>

                    <div style=""font-size:12px;font-weight:700;color:#002B55;margin-bottom:3px;"">Dear Sir/Madam,</div>
                    <div style=""font-size:11px;color:#64748B;padding-left:14px;margin-bottom:14px;"">We take pleasure in submitting our competitive offer for your requirement.</div>

                    <!-- 5. Orange-Header Product Table -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""width:100%;border:1px solid #D6E0EC;border-collapse:collapse;margin-bottom:16px;"">
                      <thead>
                        <tr style=""background-color:#FF7900;color:#ffffff;"">
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:34px;"">SR.<br/>NO.</th>
                          <th style=""padding:8px 8px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:left;"">DESCRIPTION</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:62px;"">IMAGE</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:60px;"">HSN<br/>CODE</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:44px;"">GST<br/>(%)</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:36px;"">QTY</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:40px;"">UOM</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:78px;"">UNIT RATE<br/>(INR)</th>
                          <th style=""padding:8px 6px;border-right:1px solid #fb923c;font-size:9px;font-weight:700;text-transform:uppercase;text-align:center;width:58px;"">DISCOUNT<br/>(%)</th>
                          <th style=""padding:8px 10px;font-size:9px;font-weight:700;text-transform:uppercase;text-align:right;width:94px;"">TOTAL AMOUNT (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsRowsHtml}
                        <tr style=""background-color:#F5F8FC;border-top:2px solid #D6E0EC;"">
                          <td colspan=""9"" style=""padding:9px 10px;text-align:right;font-size:12px;font-weight:800;color:#002B55;border-right:1px solid #D6E0EC;text-transform:uppercase;"">SUB TOTAL</td>
                          <td style=""padding:9px 10px;text-align:right;font-size:13px;font-weight:800;color:#FF7900;white-space:nowrap;"">&#8377;{formattedItemsSubTotal}</td>
                        </tr>
                        {grandTotalRowHtml}
                      </tbody>
                    </table>

                    <!-- 6. Commercial Terms -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-bottom:16px;"">
                      <tr>
                        <td style=""padding-bottom:6px;"">
                          <span style=""display:inline-block;width:16px;height:16px;line-height:16px;background-color:#FF7900;color:#ffffff;border-radius:4px;text-align:center;font-size:10px;font-weight:700;vertical-align:middle;"">&#9776;</span>
                          <span style=""font-size:11px;font-weight:800;color:#002B55;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;margin-left:6px;"">COMMERCIAL TERMS</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                            {termsRowsHtml}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- 7. Closing & Stamp -->
                    <div style=""font-size:11px;color:#102A50;line-height:1.55;margin-bottom:12px;"">
                      <div style=""font-weight:600;"">Thanking you,</div>
                      <div style=""font-weight:600;"">Yours faithfully,</div>
                      <div style=""font-weight:700;color:#002B55;"">For {WebUtility.HtmlEncode(companyName)}</div>
                      <div style=""margin-top:10px;margin-bottom:8px;"">
                        {stampHtml}
                      </div>
                    </div>

                    <!-- 8. Contact Note & Page Counter -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-top:1px solid #D6E0EC;padding-top:10px;"">
                      <tr>
                        <td align=""center"" style=""font-size:10px;color:#64748B;"">
                          Note: If you need any clarification or further assistance please feel free to contact
                          <div style=""font-size:11px;font-weight:700;color:#002B55;margin-top:2px;"">Mr. Irfan Attar</div>
                        </td>
                      </tr>
                      <tr>
                        <td align=""right"" style=""font-size:10px;color:#64748B;padding-top:6px;"">Page 1 of 1</td>
                      </tr>
                    </table>

                    <!-- 9. Accept / Reject Action Buttons -->
                    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-top:18px;border-top:1px solid #D6E0EC;padding-top:18px;"">
                      <tr>
                        <td align=""center"">
                          <a href=""{WebUtility.HtmlEncode(acceptUrl)}"" style=""display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px;margin:4px 6px;"">
                            &#10003;&nbsp; Accept Quotation
                          </a>
                          <a href=""{WebUtility.HtmlEncode(rejectUrl)}"" style=""display:inline-block;background-color:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px;margin:4px 6px;"">
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

            await _emailService.SendEmailAsync(customerEmail, subject, htmlBody, inlineImages);

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
