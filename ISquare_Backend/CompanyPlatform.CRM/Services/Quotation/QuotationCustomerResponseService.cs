using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
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

            var publicUrl = BuildPublicUrl(responseEntity.PublicResponseId);
            var acceptUrl = $"{publicUrl}?action=accept";
            var rejectUrl = $"{publicUrl}?action=reject";

            var subject = !string.IsNullOrWhiteSpace(dto?.Subject)
                ? dto.Subject.Trim()
                : $"Commercial Quotation {quotation.QuotationNumber} (Rev {quotation.RevisionNumber}) from {companyName}";

            if (string.IsNullOrWhiteSpace(dto?.HtmlBody))
            {
                throw new ArgumentException("Quotation email HTML body is required.");
            }

            var inlineImages = new List<EmailInlineImage>();
            var htmlBody = dto.HtmlBody
                .Replace("{{ACCEPT_URL}}", WebUtility.HtmlEncode(acceptUrl))
                .Replace("{{REJECT_URL}}", WebUtility.HtmlEncode(rejectUrl));

            int imgCounter = 0;
            htmlBody = Regex.Replace(
                htmlBody,
                @"src=""data:(image\/[a-zA-Z0-9+.-]+);base64,([^""]+)""",
                match =>
                {
                    var mime = match.Groups[1].Value;
                    var b64 = match.Groups[2].Value;
                    try
                    {
                        var bytes = Convert.FromBase64String(b64);
                        if (bytes.Length > 0)
                        {
                            var cid = $"inline-img-{++imgCounter}";
                            var ext = mime.Contains("jpeg") || mime.Contains("jpg") ? ".jpg" : ".png";
                            inlineImages.Add(new EmailInlineImage(cid, bytes, mime, $"{cid}{ext}"));
                            return $@"src=""cid:{cid}""";
                        }
                    }
                    catch
                    {
                        // leave original src if invalid base64
                    }
                    return match.Value;
                },
                RegexOptions.IgnoreCase);

            if (string.IsNullOrWhiteSpace(dto?.PdfBase64))
            {
                throw new ArgumentException("Quotation PDF attachment is required.");
            }

            var attachments = new List<EmailAttachment>();
            try
            {
                var rawBase64 = dto.PdfBase64.Trim();
                var commaIndex = rawBase64.IndexOf(',');
                if (commaIndex >= 0)
                {
                    rawBase64 = rawBase64[(commaIndex + 1)..];
                }
                var pdfBytes = Convert.FromBase64String(rawBase64);
                if (pdfBytes.Length == 0)
                {
                    throw new InvalidOperationException("Generated quotation PDF attachment is empty.");
                }

                var safeNumber = string.IsNullOrWhiteSpace(quotation.QuotationNumber)
                    ? $"QT-{quotation.QuotationId}"
                    : quotation.QuotationNumber.Trim();
                var fileName = !string.IsNullOrWhiteSpace(dto.PdfFileName)
                    ? Path.GetFileName(dto.PdfFileName.Trim())
                    : $"{safeNumber}.pdf";
                if (!fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    fileName += ".pdf";
                }
                attachments.Add(new EmailAttachment(pdfBytes, fileName, "application/pdf"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process PDF attachment for Quotation {QuotationId}.", quotationId);
                throw new InvalidOperationException("Failed to attach quotation PDF to the email.", ex);
            }

            await _emailService.SendEmailAsync(customerEmail, subject, htmlBody, inlineImages, attachments);

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
