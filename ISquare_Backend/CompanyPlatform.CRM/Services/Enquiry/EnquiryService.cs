using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Enquiry;
using CompanyPlatform.CRM.Services.Enquiry;

using CompanyModel = CompanyPlatform.Core.Models.CRM.Company.Company;
using EmployeeModel = CompanyPlatform.Core.Models.CRM.Company.Employee;
using BDEUserModel = CompanyPlatform.Core.Models.CRM.BDEUser;
using PaymentTermModel = CompanyPlatform.Core.Models.CRM.PaymentTerm.PaymentTerm;
using CompanyPlatform.Core.Models;
namespace CompanyPlatform.CRM.Services.Enquiry
{
    public class EnquiryService : IEnquiryService
    {
        private readonly IRepositories<Core.Models.CRM.Enquiry> _enquiryRepository;
        private readonly IRepositories<CompanyModel> _companyRepository;
        private readonly IRepositories<EnquiryType> _typeRepository;
        private readonly IRepositories<EnquirySource> _sourceRepository;
        private readonly IRepositories<EnquiryStatus> _statusRepository;
        private readonly IRepositories<EnquiryStage> _stageRepository;
        private readonly IRepositories<EnquiryPriority> _priorityRepository;
        private readonly IRepositories<ProductCategory> _categoryRepository;
        private readonly IRepositories<UnitOfMeasure> _uomRepository;
        private readonly IRepositories<PlaceOfSupply> _posRepository;
        private readonly IRepositories<Currency> _currencyRepository;
        private readonly IRepositories<SalesTerritory> _territoryRepository;
        //private readonly IRepositories<ActivityTypeModel> _activityTypeRepository;
        private readonly IRepositories<LostReason> _lostReasonRepository;
        private readonly IRepositories<Department> _departmentRepository;
        private readonly IRepositories<PaymentTermModel> _paymentTermRepository;
        private readonly ILogger<EnquiryService> _logger;
        private static readonly SemaphoreSlim _codeLock = new(1, 1);

        public EnquiryService(
            IRepositories<Core.Models.CRM.Enquiry> enquiryRepository,
            IRepositories<CompanyModel> companyRepository,
            IRepositories<EnquiryType> typeRepository,
            IRepositories<EnquirySource> sourceRepository,
            IRepositories<EnquiryStatus> statusRepository,
            IRepositories<EnquiryStage> stageRepository,
            IRepositories<EnquiryPriority> priorityRepository,
            IRepositories<ProductCategory> categoryRepository,
            IRepositories<UnitOfMeasure> uomRepository,
            IRepositories<PlaceOfSupply> posRepository,
            IRepositories<Currency> currencyRepository,
            IRepositories<SalesTerritory> territoryRepository,
            //IRepositories<ActivityTypeModel> activityTypeRepository,
            IRepositories<LostReason> lostReasonRepository,
            IRepositories<Department> departmentRepository,
            IRepositories<PaymentTermModel> paymentTermRepository,
            ILogger<EnquiryService> logger)
        {
            _enquiryRepository = enquiryRepository;
            _companyRepository = companyRepository;
            _typeRepository = typeRepository;
            _sourceRepository = sourceRepository;
            _statusRepository = statusRepository;
            _stageRepository = stageRepository;
            _priorityRepository = priorityRepository;
            _categoryRepository = categoryRepository;
            _uomRepository = uomRepository;
            _posRepository = posRepository;
            _currencyRepository = currencyRepository;
            _territoryRepository = territoryRepository;
           // _activityTypeRepository = activityTypeRepository;
            _lostReasonRepository = lostReasonRepository;
            _departmentRepository = departmentRepository;
            _paymentTermRepository = paymentTermRepository;
            _logger = logger;
        }

        public async Task<string> GetNextEnquiryNumberAsync()
        {
            await _codeLock.WaitAsync();
            try
            {
                return await GenerateNextEnquiryCodeInternalAsync();
            }
            finally
            {
                _codeLock.Release();
            }
        }

        private async Task<string> GenerateNextEnquiryCodeInternalAsync()
        {
            var enquiries = (await _enquiryRepository.GetAll()).ToList();
            int maxNumber = 0;
            var existingCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var e in enquiries)
            {
                if (string.IsNullOrWhiteSpace(e.EnquiryNumber)) continue;
                var code = e.EnquiryNumber.Trim();
                existingCodes.Add(code);

                var match = Regex.Match(code, @"^ENQ-?(\d+)$", RegexOptions.IgnoreCase);
                if (match.Success && int.TryParse(match.Groups[1].Value, out int numVal))
                {
                    if (numVal > maxNumber) maxNumber = numVal;
                }
            }

            int nextNum = maxNumber + 1;
            string candidateCode = $"ENQ-{nextNum:D4}";
            while (existingCodes.Contains(candidateCode))
            {
                nextNum++;
                candidateCode = $"ENQ-{nextNum:D4}";
            }

            return candidateCode;
        }

        public async Task<IEnumerable<EnquiryDto>> GetAllEnquiriesAsync()
        {
            _logger.LogInformation("Fetching all active enquiries.");
            var items = (await _enquiryRepository.GetAll()).Where(e => !e.IsDeleted).ToList();
            return await MapEnquiriesToDtoAsync(items);
        }

        public async Task<EnquiryDto?> GetEnquiryByIdAsync(int id)
        {
            var item = await _enquiryRepository.GetByIdAsync(id);
            if (item == null || item.IsDeleted) return null;

            var list = await MapEnquiriesToDtoAsync(new List<Core.Models.CRM.Enquiry> { item });
            return list.FirstOrDefault();
        }

        public async Task<EnquiryDto> CreateEnquiryAsync(EnquiryCreateDto dto)
        {
            await _codeLock.WaitAsync();
            try
            {
                // Business rule: Lost Reason is mandatory when Status is "Lost"
                var status = await _statusRepository.GetByIdAsync(dto.EnquiryStatusId);
                if (status != null && status.EnquiryStatusName.Equals("Lost", StringComparison.OrdinalIgnoreCase))
                {
                    if (!dto.LostReasonId.HasValue || dto.LostReasonId <= 0)
                    {
                        throw new InvalidOperationException("Lost Reason is mandatory when Status is 'Lost'.");
                    }
                }

                string enqNumber = string.IsNullOrWhiteSpace(dto.EnquiryNumber)
                    ? await GenerateNextEnquiryCodeInternalAsync()
                    : dto.EnquiryNumber.Trim();

                var entity = new Core.Models.CRM.Enquiry
                {
                    EnquiryNumber = enqNumber,
                    EnquiryDate = dto.EnquiryDate,
                    EnquiryTypeId = dto.EnquiryTypeId,
                    EnquirySourceId = dto.EnquirySourceId,
                    CustomerId = dto.CustomerId,
                    ContactId = dto.ContactId,
                    ContactName = dto.ContactName,
                    DepartmentName = dto.DepartmentName,
                    Designation = dto.Designation,
                    ContactMobile = dto.ContactMobile,
                    ContactEmail = dto.ContactEmail,
                    ProductCategoryId = dto.ProductCategoryId,
                    RequirementSubject = dto.RequirementSubject,
                    CustomerRequirement = dto.CustomerRequirement,
                    RequiredQuantity = dto.RequiredQuantity,
                    UnitOfMeasureId = dto.UnitOfMeasureId,
                    DeliveryTimeline = dto.DeliveryTimeline,
                    PlaceOfSupplyId = dto.PlaceOfSupplyId,
                    TechnicalSpecificationNotes = dto.TechnicalSpecificationNotes,
                    ExpectedOrderValue = dto.ExpectedOrderValue,
                    CurrencyId = dto.CurrencyId,
                    CustomerBudget = dto.CustomerBudget,
                    ExpectedClosingDate = dto.ExpectedClosingDate,
                    ProbabilityPercentage = dto.ProbabilityPercentage,
                    PaymentTermId = dto.PaymentTermId,
                    CustomerCreditLimit = dto.CustomerCreditLimit,
                    EstimatedTaxPercent = dto.EstimatedTaxPercent,
                    EnquiryStatusId = dto.EnquiryStatusId,
                    EnquiryStageId = dto.EnquiryStageId,
                    EnquiryPriorityId = dto.EnquiryPriorityId,
                    SalesManagerId = dto.SalesManagerId,
                    SalesManagerName = dto.SalesManagerName,
                    BDEUserId = dto.BDEUserId,
                    BDEUserName = dto.BDEUserName,
                    DepartmentId = dto.DepartmentId,
                    SalesTerritoryId = dto.SalesTerritoryId,
                    ResponsiblePerson = dto.ResponsiblePerson,
                    NextFollowUpDate = dto.NextFollowUpDate,
                    ActivityTypeId = dto.ActivityTypeId,
                    NextAction = dto.NextAction,
                    Reminder = dto.Reminder,
                    ActivityDiscussionNotes = dto.ActivityDiscussionNotes,
                    LostReasonId = dto.LostReasonId,
                    OutcomeInternalRemarks = dto.OutcomeInternalRemarks,
                    DocumentReference = dto.DocumentReference,
                    DocumentName = dto.DocumentName,
                    DocumentFilePath = dto.DocumentFilePath,
                    TermsAndConditions = dto.TermsAndConditions,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedBy = dto.CreatedBy ?? 1,
                    CreatedDate = DateTime.UtcNow
                };

                await _enquiryRepository.Create(entity);

                var createdDto = await GetEnquiryByIdAsync(entity.EnquiryId);
                return createdDto!;
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<bool> UpdateEnquiryAsync(int id, EnquiryUpdateDto dto)
        {
            var entity = await _enquiryRepository.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted) return false;

            // Business rule: Lost Reason is mandatory when Status is "Lost"
            var status = await _statusRepository.GetByIdAsync(dto.EnquiryStatusId);
            if (status != null && status.EnquiryStatusName.Equals("Lost", StringComparison.OrdinalIgnoreCase))
            {
                if (!dto.LostReasonId.HasValue || dto.LostReasonId <= 0)
                {
                    throw new InvalidOperationException("Lost Reason is mandatory when Status is 'Lost'.");
                }
            }

            entity.EnquiryDate = dto.EnquiryDate;
            entity.EnquiryTypeId = dto.EnquiryTypeId;
            entity.EnquirySourceId = dto.EnquirySourceId;
            entity.CustomerId = dto.CustomerId;
            entity.ContactId = dto.ContactId;
            entity.ContactName = dto.ContactName;
            entity.DepartmentName = dto.DepartmentName;
            entity.Designation = dto.Designation;
            entity.ContactMobile = dto.ContactMobile;
            entity.ContactEmail = dto.ContactEmail;
            entity.ProductCategoryId = dto.ProductCategoryId;
            entity.RequirementSubject = dto.RequirementSubject;
            entity.CustomerRequirement = dto.CustomerRequirement;
            entity.RequiredQuantity = dto.RequiredQuantity;
            entity.UnitOfMeasureId = dto.UnitOfMeasureId;
            entity.DeliveryTimeline = dto.DeliveryTimeline;
            entity.PlaceOfSupplyId = dto.PlaceOfSupplyId;
            entity.TechnicalSpecificationNotes = dto.TechnicalSpecificationNotes;
            entity.ExpectedOrderValue = dto.ExpectedOrderValue;
            entity.CurrencyId = dto.CurrencyId;
            entity.CustomerBudget = dto.CustomerBudget;
            entity.ExpectedClosingDate = dto.ExpectedClosingDate;
            entity.ProbabilityPercentage = dto.ProbabilityPercentage;
            entity.PaymentTermId = dto.PaymentTermId;
            entity.CustomerCreditLimit = dto.CustomerCreditLimit;
            entity.EstimatedTaxPercent = dto.EstimatedTaxPercent;
            entity.EnquiryStatusId = dto.EnquiryStatusId;
            entity.EnquiryStageId = dto.EnquiryStageId;
            entity.EnquiryPriorityId = dto.EnquiryPriorityId;
            entity.SalesManagerId = dto.SalesManagerId;
            entity.SalesManagerName = dto.SalesManagerName;
            entity.BDEUserId = dto.BDEUserId;
            entity.BDEUserName = dto.BDEUserName;
            entity.DepartmentId = dto.DepartmentId;
            entity.SalesTerritoryId = dto.SalesTerritoryId;
            entity.ResponsiblePerson = dto.ResponsiblePerson;
            entity.NextFollowUpDate = dto.NextFollowUpDate;
            entity.ActivityTypeId = dto.ActivityTypeId;
            entity.NextAction = dto.NextAction;
            entity.Reminder = dto.Reminder;
            entity.ActivityDiscussionNotes = dto.ActivityDiscussionNotes;
            entity.LostReasonId = dto.LostReasonId;
            entity.OutcomeInternalRemarks = dto.OutcomeInternalRemarks;
            entity.DocumentReference = dto.DocumentReference;
            entity.DocumentName = dto.DocumentName;
            if (!string.IsNullOrWhiteSpace(dto.DocumentFilePath))
                entity.DocumentFilePath = dto.DocumentFilePath;
            entity.TermsAndConditions = dto.TermsAndConditions;
            entity.UpdatedBy = dto.UpdatedBy ?? 1;
            entity.UpdatedDate = DateTime.UtcNow;

            await _enquiryRepository.Update(entity);
            return true;
        }

        public async Task<bool> DeleteEnquiryAsync(int id)
        {
            var entity = await _enquiryRepository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;
            await _enquiryRepository.Update(entity);
            return true;
        }

        private async Task<List<EnquiryDto>> MapEnquiriesToDtoAsync(List<Core.Models.CRM.Enquiry> enquiries)
        {
            var companies = (await _companyRepository.GetAll()).ToDictionary(c => c.CompanyId);
            var types = (await _typeRepository.GetAll()).ToDictionary(t => t.EnquiryTypeId);
            var sources = (await _sourceRepository.GetAll()).ToDictionary(s => s.EnquirySourceId);
            var statuses = (await _statusRepository.GetAll()).ToDictionary(s => s.EnquiryStatusId);
            var stages = (await _stageRepository.GetAll()).ToDictionary(s => s.EnquiryStageId);
            var priorities = (await _priorityRepository.GetAll()).ToDictionary(p => p.EnquiryPriorityId);
            var categories = (await _categoryRepository.GetAll()).ToDictionary(c => c.ProductCategoryId);
            var uoms = (await _uomRepository.GetAll()).ToDictionary(u => u.UnitOfMeasureId);
            var poss = (await _posRepository.GetAll()).ToDictionary(p => p.PlaceOfSupplyId);
            var currencies = (await _currencyRepository.GetAll()).ToDictionary(c => c.CurrencyId);
            var territories = (await _territoryRepository.GetAll()).ToDictionary(t => t.SalesTerritoryId);
            var departments = (await _departmentRepository.GetAll()).ToDictionary(d => d.ID);
           // var actTypes = (await _activityTypeRepository.GetAll()).ToDictionary(a => a.ID);
            var lostReasons = (await _lostReasonRepository.GetAll()).ToDictionary(l => l.LostReasonId);
            var paymentTerms = (await _paymentTermRepository.GetAll()).ToDictionary(p => p.PaymentTermId);

            return enquiries.Select(e =>
            {
                companies.TryGetValue(e.CustomerId, out var comp);
                types.TryGetValue(e.EnquiryTypeId, out var typ);
                sources.TryGetValue(e.EnquirySourceId, out var src);
                statuses.TryGetValue(e.EnquiryStatusId, out var st);
                stages.TryGetValue(e.EnquiryStageId, out var stg);
                priorities.TryGetValue(e.EnquiryPriorityId, out var pri);
                categories.TryGetValue(e.ProductCategoryId, out var cat);
                uoms.TryGetValue(e.UnitOfMeasureId ?? 0, out var uom);
                poss.TryGetValue(e.PlaceOfSupplyId ?? 0, out var pos);
                currencies.TryGetValue(e.CurrencyId ?? 0, out var cur);
                territories.TryGetValue(e.SalesTerritoryId ?? 0, out var ter);
                departments.TryGetValue(e.DepartmentId ?? 0, out var dep);
               // actTypes.TryGetValue(e.ActivityTypeId ?? 0, out var act);
                lostReasons.TryGetValue(e.LostReasonId ?? 0, out var lr);
                paymentTerms.TryGetValue(e.PaymentTermId ?? 0, out var pt);

                return new EnquiryDto
                {
                    EnquiryId = e.EnquiryId,
                    EnquiryNumber = e.EnquiryNumber,
                    EnquiryDate = e.EnquiryDate,
                    EnquiryTypeId = e.EnquiryTypeId,
                    EnquiryTypeName = typ?.EnquiryTypeName,
                    EnquirySourceId = e.EnquirySourceId,
                    EnquirySourceName = src?.EnquirySourceName,
                    CustomerId = e.CustomerId,
                    CustomerName = comp?.CompanyName ?? comp?.CustomerName,
                    CustomerCode = comp?.CompanyCode,
                    ContactId = e.ContactId,
                    ContactName = e.ContactName,
                    DepartmentName = e.DepartmentName,
                    Designation = e.Designation,
                    ContactMobile = e.ContactMobile,
                    ContactEmail = e.ContactEmail,
                    ProductCategoryId = e.ProductCategoryId,
                    ProductCategoryName = cat?.ProductCategoryName,
                    RequirementSubject = e.RequirementSubject,
                    CustomerRequirement = e.CustomerRequirement,
                    RequiredQuantity = e.RequiredQuantity,
                    UnitOfMeasureId = e.UnitOfMeasureId,
                    UnitOfMeasureName = uom?.UnitOfMeasureName,
                    DeliveryTimeline = e.DeliveryTimeline,
                    PlaceOfSupplyId = e.PlaceOfSupplyId,
                    PlaceOfSupplyName = pos?.PlaceOfSupplyName,
                    TechnicalSpecificationNotes = e.TechnicalSpecificationNotes,
                    ExpectedOrderValue = e.ExpectedOrderValue,
                    CurrencyId = e.CurrencyId,
                    CurrencyCode = cur?.CurrencyCode,
                    CustomerBudget = e.CustomerBudget,
                    ExpectedClosingDate = e.ExpectedClosingDate,
                    ProbabilityPercentage = e.ProbabilityPercentage,
                    PaymentTermId = e.PaymentTermId,
                    PaymentTermName = pt?.PaymentTermName,
                    CustomerCreditLimit = e.CustomerCreditLimit,
                    EstimatedTaxPercent = e.EstimatedTaxPercent,
                    EnquiryStatusId = e.EnquiryStatusId,
                    EnquiryStatusName = st?.EnquiryStatusName,
                    EnquiryStageId = e.EnquiryStageId,
                    EnquiryStageName = stg?.EnquiryStageName,
                    EnquiryPriorityId = e.EnquiryPriorityId,
                    EnquiryPriorityName = pri?.EnquiryPriorityName,
                    SalesManagerId = e.SalesManagerId,
                    SalesManagerName = e.SalesManagerName,
                    BDEUserId = e.BDEUserId,
                    BDEUserName = e.BDEUserName,
                    DepartmentId = e.DepartmentId,
                    DepartmentMasterName = dep?.DepartmentName,
                    SalesTerritoryId = e.SalesTerritoryId,
                    SalesTerritoryName = ter?.SalesTerritoryName,
                    ResponsiblePerson = e.ResponsiblePerson,
                    NextFollowUpDate = e.NextFollowUpDate,
                    ActivityTypeId = e.ActivityTypeId,
                   // ActivityTypeName = act?.ActivityName,
                    NextAction = e.NextAction,
                    Reminder = e.Reminder,
                    ActivityDiscussionNotes = e.ActivityDiscussionNotes,
                    LostReasonId = e.LostReasonId,
                    LostReasonName = lr?.LostReasonName,
                    OutcomeInternalRemarks = e.OutcomeInternalRemarks,
                    DocumentReference = e.DocumentReference,
                    DocumentName = e.DocumentName,
                    DocumentFilePath = e.DocumentFilePath,
                    TermsAndConditions = e.TermsAndConditions,
                    IsActive = e.IsActive,
                    CreatedDate = e.CreatedDate
                };
            }).ToList();
        }
    }
}