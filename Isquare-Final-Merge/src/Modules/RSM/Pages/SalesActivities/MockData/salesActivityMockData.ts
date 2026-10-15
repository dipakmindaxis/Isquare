import type {
  CustomerOption,
  EmployeeOption,
  RelatedRecordOption,
  SalesActivity,
} from "../Types/SalesActivityTypes";

export const mockCustomers: CustomerOption[] = [
  {
    id: "CUST-001",
    name: "Tata Steel Ltd",
    contactPerson: "Rajesh Sharma",
    phone: "+91 98201 44521",
    email: "r.sharma@tatasteel.com",
    industry: "Steel & Manufacturing",
    city: "Jamshedpur",
  },
  {
    id: "CUST-002",
    name: "Reliance Industries Ltd",
    contactPerson: "Vikram Singhania",
    phone: "+91 97234 11092",
    email: "vikram.singhania@ril.com",
    industry: "Petrochemicals",
    city: "Jamnagar",
  },
];

export const mockEmployees: EmployeeOption[] = [
  {
    id: "EMP-001",
    name: "Vishal Patil",
    role: "Sales Engineer",
    email: "vishal.patil@isquaresafety.com",
  },
  {
    id: "EMP-002",
    name: "Samadhan Shinde",
    role: "Key Account Manager",
    email: "samadhan.shinde@isquaresafety.com",
  },
];

export const mockRelatedRecords: RelatedRecordOption[] = [
  {
    id: "REC-001",
    type: "Enquiry",
    code: "ENQ-2026-0042",
    title: "Multi-Gas Detector System (4-Gas Portable)",
    customerId: "CUST-001",
    date: "2026-09-15",
    amount: "₹ 14,50,000",
  },
  {
    id: "REC-002",
    type: "Quotation",
    code: "QUO-2026-0108",
    title: "Fixed IR Flame Detectors & Control Panels",
    customerId: "CUST-002",
    date: "2026-09-22",
    amount: "₹ 38,20,000",
  },
];

const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const initialSalesActivities: SalesActivity[] = [
  {
    id: "ACT-001",
    activityCode: "ACT-2026-001",
    activityType: "Customer Visit",
    subject: "Plant Gas Detection Audit",
    customerId: "CUST-001",
    customerName: "Tata Steel Ltd",
    contactPerson: "Rajesh Sharma",
    contactPhone: "+91 98201 44521",
    contactEmail: "r.sharma@tatasteel.com",
    assignedEmployeeId: "EMP-001",
    assignedEmployeeName: "Vishal Patil",
    activityDate: getFormattedDate(-2),
    activityTime: "11:00 AM",
    durationMinutes: 60,
    status: "Completed",
    discussionNotes:
      "Visited Blast Furnace 4. Reviewed sensor mounting locations and calibration schedule.",
    outcome: "Client requested quotation for 12 IR gas sensors.",
    nextActionDate: getFormattedDate(2),
    nextActionDetails: "Submit revised quotation with delivery timeline.",
    relatedRecordType: "Enquiry",
    relatedRecordId: "REC-001",
    relatedRecordCode: "ENQ-2026-0042",
    relatedRecordTitle: "Multi-Gas Detector System (4-Gas Portable)",
    location: "Blast Furnace #4, Jamshedpur Works",
    photographs: [
      {
        id: "PHOTO-1",
        name: "sensor_mounting_location.jpg",
        size: 1024 * 650,
        type: "image/jpeg",
        uploadedAt: "11:45 AM",
      },
    ],
    documents: [
      {
        id: "DOC-1",
        name: "Site_Audit_Report.pdf",
        size: 1024 * 1100,
        type: "application/pdf",
        uploadedAt: "01:30 PM",
      },
    ],
    createdAt: "2026-10-07T11:00:00Z",
    updatedAt: "2026-10-07T14:00:00Z",
  },
  {
    id: "ACT-002",
    activityCode: "ACT-2026-002",
    activityType: "Phone Call",
    subject: "Follow-up on Flame Detector Quotation",
    customerId: "CUST-002",
    customerName: "Reliance Industries Ltd",
    contactPerson: "Vikram Singhania",
    contactPhone: "+91 97234 11092",
    contactEmail: "vikram.singhania@ril.com",
    assignedEmployeeId: "EMP-002",
    assignedEmployeeName: "Samadhan Shinde",
    activityDate: getFormattedDate(-1),
    activityTime: "03:30 PM",
    durationMinutes: 15,
    status: "Overdue",
    discussionNotes:
      "Discussed quotation QUO-2026-0108. Client requested live product demonstration before final approval.",
    outcome: "Product demonstration required at refinery.",
    nextActionDate: getFormattedDate(-1),
    nextActionDetails: "Coordinate demo kit with engineering team.",
    relatedRecordType: "Quotation",
    relatedRecordId: "REC-002",
    relatedRecordCode: "QUO-2026-0108",
    relatedRecordTitle: "Fixed IR Flame Detectors & Control Panels",
    callOutcome: "Connected - Follow-up Required",
    photographs: [],
    documents: [],
    createdAt: "2026-10-08T15:30:00Z",
    updatedAt: "2026-10-08T16:00:00Z",
  },
];
