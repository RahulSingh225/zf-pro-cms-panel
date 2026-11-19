// Shared report export helpers.
//
// MIS & Analytics is the reference: every row mapper below is the exact mapping that
// MIS & Analytics report used for its Export button. Both MIS & Analytics (ExportButton)
// and Data Export use these helpers, so the same report produces the same file
// (same columns, same values, same file name) from either place.

import {
    ApplicationLoginReportKeys,
    RegisteredUsersReportKeys,
    QRTransactionReportKeys,
    ReferralsReportKeys,
    RedemptionReportKeys,
    OtpReportKeys,
    AmazonMarketplaceKeys,
    BankDetailsReportKeys,
    KycReportKeys,
    ProductWiseReportKeys,
    CategoryReportKeys,
    ErrorTransactionReportKeys,
    NotificationReportKeys,
    BlockedMemberReportKeys,
    BlockedMemberScanReportKeys,
    AnomalyTransactionsReportKeys,
    CategoriesListKeys,
    SubCategoriesListKeys,
    ShockReplacementReportKeys,
    TicketsListKeys,
} from "./ExportKeyMappings";
import { ExporterType } from "../types/Export";

export type ReportName = ExporterType["reportName"];

// =======================================
//  FORMATTERS
// =======================================

export const formatCell = (value: any) => {
    if (value === null || value === undefined || value === "") return "-";
    return value;
};

// YYYY-MM-DD HH:mm:ss
export const formatDateTime = (value: any): string => {
    if (!value || value === "-") return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

// DD-MM-YYYY
export const formatDoj = (value: any): string => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

// DD-MM-YYYY; returns '-' for invalid or implausible dates
export const formatDob = (value: any): string => {
    if (!value || value === "-" || value === "N/A") return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    const year = d.getFullYear();
    if (year < 1900 || year > new Date().getFullYear()) return "-";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${year}`;
};

export const formatRegisteredUserStatus = (value: any) => {
    if (value === "active_members") return "Active User";
    if (value === "digilocker") return "Digilocker Pending";
    if (value === "kyc") return "KYC Document Upload Pending";
    if (value === "incomplete-registration") return "Address and Profile";
    if (value === "incomplete-profile") return "Address and Profile";
    if (value === "tds-consent") return "TDS Consent Pending";
    if (value === "kyc-admin") return "Admin Approval Pending";
    if (!value || value === "-") return "-";
    return String(value)
        .split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export const formatKycStatus = (value: any) => {
    if (value === "active_members") return "Active User";
    if (value === "digilocker") return "Digilocker Pending";
    if (value === "kyc") return "KYC Document Upload Pending";
    if (value === "incomplete-registration") return "Address and Profile";
    if (value === "tds-consent") return "TDS Consent Pending";
    if (value === "kyc-admin") return "Approval Pending";
    if (value === "kyc-regional-manager" || value === "Regional Manager Approval Pending" || value === "Regional Head Pending") return "Regional Head Pending";
    if (value === "kyc-marketing-manager" || value === "Marketing Manager Approval Pending" || value === "Marketing Head Pending") return "Marketing Head Pending";
    return formatCell(value);
};

export const formatKycDocStatus = (value: any): string => {
    if (!value || value === "-") return "-";
    return String(value)
        .split(" ")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
};

// 'forgot-password' → 'Forgot Password'
export const formatOtpType = (value: any): string => {
    if (!value) return "-";
    const knownMap: Record<string, string> = {
        "forgot-password": "Forgot Password",
        "verify-mobile": "Verify Mobile",
        "verify-email": "Verify Email",
        "login-otp": "Login OTP",
        "registration": "Registration",
        "resend-otp": "Resend OTP",
        "change-password": "Change Password",
        "tds-consent": "TDS Consent",
    };
    if (knownMap[value]) return knownMap[value];
    return String(value)
        .split(/[-_]+/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
};

// =======================================
//  ROW MAPPERS (raw API row → export row)
// =======================================

export const mapApplicationLoginRow = (item: any) => ({
    userName: formatCell(item.userName),
    userCode: formatCell(item.userCode),
    userMobile: formatCell(item.userMobile),
    firstLogin: formatCell(item.firstLogin),
    lastLogin: formatCell(item.lastLogin),
    loginDevice: formatCell(item.loginDevice),
    logoutDate: formatCell(item.logoutAt),
    welcomePoints: formatCell(item.welcomePoints),
    totalScannedPoints: formatCell(item.scannedPoints),
    totalRewardPoints: formatCell(item.rewardPoints),
    totalRedeemedPoints: formatCell(item.redeemedPoints),
    totalBalancePoints: formatCell(item.balancePoints),
});

// Note: the API returns `mobile` and `aadhaarNumberMasked`, which are renamed here.
export const mapRegisteredUserRow = (item: any) => ({
    userId: formatCell(item.userId),
    uniqueCode: formatCell(item.uniqueCode),
    roleName: formatCell(item.roleName),
    status: formatRegisteredUserStatus(item.status),
    email: formatCell(item.email),
    mobileNumber: formatCell(item.mobile),
    fullName: formatCell(item.fullName),
    aadhaarMasked: formatCell(item.aadhaarNumberMasked),
    panNumber: formatCell(item.panNumber),
    aadhaarStatus: item.aadhaarStatus ? "Verified" : "Not Verified",
    gender: formatCell(item.gender),
    age: formatCell(item.age),
    country: formatCell(item.country),
    state: formatCell(item.state),
    city: formatCell(item.city),
    pincode: formatCell(item.pincode),
    zone: formatCell(item.zone),
    mappedRetailers: Array.isArray(item.mappedRetailers)
        ? formatCell(item.mappedRetailers.join(", "))
        : formatCell(item.mappedRetailers),
    workshopName: formatCell(item.workshopName),
    dateOfJoining: formatDoj(item.dateOfJoining),
});

export const mapQrTransactionRow = (item: any) => ({
    transactionId: formatCell(item.transactionId),
    transactionDate: formatCell(item.transactionDate),
    amount: formatCell(item.amount),
    paymentStatus: formatCell(item.paymentStatus),
    qrCodeId: formatCell(item.qrCodeId),
    partNumber: formatCell(item.partNumber),
    partName: formatCell(item.partName),
    userCode: formatCell(item.userCode),
    userName: formatCell(item.userName),
    gender: formatCell(item.gender),
    email: formatCell(item.email),
    phone: formatCell(item.phone),
    latitude: formatCell(item.latitude),
    longitude: formatCell(item.longitude),
    address: formatCell(item.address),
    city: formatCell(item.city),
    state: formatCell(item.state),
    country: formatCell(item.country),
    workshopName: formatCell(item.workshopName),
});

export const mapRedemptionRow = (item: any) => ({
    redemptionId: item.redemptionId,
    products: item.products,
    redemptionRef: formatCell(item.redemptionRef),
    userName: formatCell(item.userName),
    userCode: formatCell(item.userCode),
    redeemedPoints: formatCell(item.redeemedPoints),
    redemptionMode: formatCell(item.redemptionMode),
    redemptionStatus: formatCell(item.redemptionStatus),
    userMobile: formatCell(item.userMobile),
    userRole: formatCell(item.userRole),
    dateOfJoining: formatCell(item.dateOfJoining),
    totalEarnedPoints: formatCell(item.totalEarnedPoints),
    createdAt: formatCell(item.createdAt),
    redemptionProcessedDate: formatCell(item.redemptionProcessedDate),
    redemptionDetails: formatCell(item.redemptionDetails),
});

export const mapReferralRow = (item: any) => ({
    senderUniqueCode: formatCell(item.senderUniqueCode),
    senderMobileNumber: formatCell(item.senderMobileNumber),
    senderName: formatCell(item.senderName),
    receiverUniqueCode: formatCell(item.receiverUniqueCode),
    receiverMobileNumber: formatCell(item.receiverMobileNumber),
    receiverName: formatCell(item.receiverName),
    referralCode: formatCell(item.referralCode),
    pointsEarnedBySender: formatCell(item.pointsEarnedBySender),
    pointsEarnedByReceiver: formatCell(item.pointsEarnedByReceiver),
    dateOfReferral: formatCell(item.dateOfReferral),
});

export const mapOtpRow = (item: any) => ({
    ...item,
    otpType: formatOtpType(item.otpType),
    isVerified: item.isVerified ? "Yes" : "No",
});

export const mapBankDetailsRow = (item: any) => ({
    userId: formatCell(item.userId),
    uniqueCode: formatCell(item.uniqueCode),
    name: formatCell(item.name),
    roleName: formatCell(item.roleName),
    mobileNumber: formatCell(item.mobileNumber),
    bankName: formatCell(item.bankName),
    accountNumber: formatCell(item.accountNumber),
    ifscCode: formatCell(item.ifscCode),
    accountType: formatCell(item.accountType),
    branchName: formatCell(item.branchName),
    bankAddress: formatCell(item.bankAddress),
    upiId: formatCell(item.upiId),
});

export const mapKycRow = (item: any) => ({
    userId: formatCell(item.userId),
    uniqueCode: formatCell(item.uniqueCode),
    name: formatCell(item.name),
    workshopName: formatCell(item.workshopName),
    zone: formatCell(item.zone),
    roleName: formatCell(item.roleName),
    mobileNumber: formatCell(item.mobileNumber),
    emailId: formatCell(item.emailId),
    status: formatKycStatus(item.status),
    kycVerified: formatCell(item.kycVerified),
    dob: formatDob(item.dateOfBirth ?? item.dob),
    createdAt: formatDateTime(item.createdAt),
    aadhaarNumber: formatCell(item.aadhaarNumber),
    aadhaarFront: formatCell(item.aadhaarFrontImage ?? item.aadhaarFront),
    aadhaarBack: formatCell(item.aadhaarBackImage ?? item.aadhaarBack),
    panFront: formatCell(item.panFrontImage ?? item.panFront),
    profileImage: formatCell(item.profileImage),
    kycDocStatus: formatKycDocStatus(item.kycDocStatus),
});

export const mapProductWiseRow = (item: any) => ({
    userId: formatCell(item.userId),
    memberName: formatCell(item.memberName),
    workshop: formatCell(item.workshop ?? item.workshopName),
    zone: formatCell(item.zone),
    city: formatCell(item.city),
    productCode: formatCell(item.productCode),
    productCategory: formatCell(item.productCategory),
    productType: formatCell(item.productType),
    productDescription: formatCell(item.productDescription),
    userType: formatCell(item.userType),
    district: formatCell(item.district),
    state: formatCell(item.state),
    scanDate: formatDateTime(item.scanDate),
    pointsEarned: formatCell(item.pointsEarned),
});

export const mapCategoryRow = (item: any) => ({
    categoryName: formatCell(item.categoryName),
    userType: formatCell(item.userType),
    productsInCategory: formatCell(item.productsInThisCategory ?? item.productsInCategory),
    bonusPoints: formatCell(item.bonusPoints),
    bonusPointsActive: formatCell(item.bonusPointsActive),
});

export const mapErrorTransactionRow = (item: any) => ({
    userName: formatCell(item.userName),
    userMobile: formatCell(item.userMobileNumber ?? item.userMobile),
    dateOfJoining: formatDateTime(item.dateOfJoining),
    userType: formatCell(item.userType),
    district: formatCell(item.district),
    state: formatCell(item.state),
    scanDate: formatDateTime(item.scanDate),
    qrDetails: formatCell(item.qrDetails),
    productCode: formatCell(item.productCode),
    productDescription: formatCell(item.productDescription),
    message: formatCell(item.message),
    productStatus: formatCell(item.productStatus),
    actionTaken: formatCell(item.actionTaken),
});

export const mapBlockedMemberRow = (item: any) => ({
    userName: formatCell(item.userName),
    mobileNumber: formatCell(item.mobileNumber),
    userType: formatCell(item.userType),
    district: formatCell(item.district),
    state: formatCell(item.state),
    dateOfJoining: formatDateTime(item.dateOfJoining),
    totalEarnedPoints: formatCell(item.totalEarnedPoints),
    redeemedPoints: formatCell(item.redeemedPoints),
    redemptionRequestDate: formatDateTime(item.redemptionRequestDate),
    redemptionProcessedDate: formatDateTime(item.redemptionProcessedDate),
    redemptionDetails: formatCell(item.redemptionDetails),
    upiId: formatCell(item.upiId),
    accountNumber: formatCell(item.accountNumber),
    accountHolderName: formatCell(item.accountHolderName),
    ifscCode: formatCell(item.ifscCode),
    bankName: formatCell(item.bankName),
    status: formatCell(item.status),
});

export const mapBlockedMemberScanRow = (item: any) => ({
    userName: formatCell(item.userName),
    mobileNumber: formatCell(item.mobileNumber),
    district: formatCell(item.district),
    state: formatCell(item.state),
    dateOfJoining: formatDateTime(item.dateOfJoining),
    scanId: formatCell(item.scanId),
    dateOfScan: formatDateTime(item.dateOfScan),
    productCategory: formatCell(item.productCategory),
    productCode: formatCell(item.productCode),
    productName: formatCell(item.productName),
    productDescription: formatCell(item.productDescription),
    qrDetails: formatCell(item.qrDetails),
    basePoint: formatCell(item.basePoint),
    extraBonusPoint: formatCell(item.extraBonusPoint),
    totalPoints: formatCell(item.totalPoints),
    scanStatus: formatCell(item.scanStatus),
});

export const mapAnomalyTransactionRow = (item: any) => ({
    referenceId: formatCell(item.referenceId),
    district: formatCell(item.district),
    state: formatCell(item.state),
    influencerName: formatCell(item.influencerName),
    userMobile: formatCell(item.userMobileNumber ?? item.userMobile),
    dateOfJoining: formatDateTime(item.dateOfJoining),
    productQr: formatCell(item.productQR ?? item.productQr),
    productCategoryScanned: formatCell(item.productCategoryScanned),
    dateOfScan: formatDateTime(item.dateOfScan),
    frequencyOfAnomaly: formatCell(item.frequencyOfAnomaly),
    anomalyValueScanned: formatCell(item.anomalyValueScanned),
    totalPointsEarned: formatCell(item.totalPointsEarned),
    totalPointsRedeemed: formatCell(item.totalPointsRedeemed),
    totalPointsScanned: formatCell(item.totalPointsScanned),
    firstScanDate: formatDateTime(item.firstScanDate),
    lastScanDate: formatDateTime(item.lastScanDate),
    lastScanId: formatCell(item.lastScanId),
    updatedAt: formatDateTime(item.updatedAt),
    actionTaken: formatCell(item.actionTaken),
});

export const mapShockReplacementRow = (item: any) => ({
    id: formatCell(item.id),
    userName: formatCell(item.userName),
    skuCode: formatCell(item.skuCode || item.sku),
    skuName: formatCell(item.skuName || item.sku_name),
    quantity: formatCell(item.quantity),
    createdAt: formatCell(item.created_at || item.createdAt),
    createdBy: formatCell(item.created_by || item.createdBy),
});

// =======================================
//  EXCEL / CSV ROW BUILDING
// =======================================

export const REPORT_EXPORT_KEYS: Record<string, Record<string, string>> = {
    "Application Login Report": ApplicationLoginReportKeys,
    "Registered Users Report": RegisteredUsersReportKeys,
    "QR Transaction Report": QRTransactionReportKeys,
    "Referrals Report": ReferralsReportKeys,
    "Redemption Report": RedemptionReportKeys,
    "OTP Report": OtpReportKeys,
    "Amazon Marketplace": AmazonMarketplaceKeys,
    "Bank Details Report": BankDetailsReportKeys,
    "KYC Report": KycReportKeys,
    "Product Wise Report": ProductWiseReportKeys,
    "Category Report": CategoryReportKeys,
    "Error Transaction Report": ErrorTransactionReportKeys,
    "Notification Report": NotificationReportKeys,
    "Blocked Member Report": BlockedMemberReportKeys,
    "Blocked Member Scan Report": BlockedMemberScanReportKeys,
    "Anomaly Transactions Report": AnomalyTransactionsReportKeys,
    "Categories List": CategoriesListKeys,
    "Subcategories List": SubCategoriesListKeys,
    "Shock Replacement Report": ShockReplacementReportKeys,
    "Tickets List": TicketsListKeys,
};

const DATE_FIELDS = [
    "firstLogin",
    "lastLogin",
    "logoutDate",
    "transactionDate",
    "dob",
    "dateOfReferral",
    "createdAt",
    "redemptionProcessedDate",
    "dateOfJoining",
    "scanDate",
    "deliveredDate",
    "sentDate",
    "redemptionRequestDate",
    "dateOfScan",
    "firstScanDate",
    "lastScanDate",
    "updatedAt",
];

const NUMBER_FIELDS = [
    "TicketID",
    "quantity",
    "welcomePoints",
    "totalScannedPoints",
    "totalRewardPoints",
    "totalRedeemedPoints",
    "totalBalancePoints",
    "pointsEarnedBySender",
    "pointsEarnedByReceiver",
    "redeemedPoints",
    "totalEarnedPoints",
    "amount",
    "productsInCategory",
    "bonusPoints",
    "basePoint",
    "extraBonusPoint",
    "totalPoints",
    "anomalyValueScanned",
    "totalPointsScanned",
    "frequencyOfAnomaly",
];

// Converts mapped rows into sheet rows with the report's column headers.
// Returns null when the report has no column mapping.
export const buildExportSheetRows = (reportName: string, data: any[]) => {
    const mappings = REPORT_EXPORT_KEYS[reportName];
    if (!mappings) return null;

    return data.map((ele: any) =>
        Object.keys(mappings).reduce((acc: any, key: string) => {
            if (DATE_FIELDS.includes(key)) {
                if (!ele[key]) {
                    acc[mappings[key]] = "-";
                } else {
                    const parsed = new Date(ele[key]);
                    // Pre-formatted strings (e.g. DD-MM-YYYY) fail to parse — keep them as-is
                    acc[mappings[key]] = isNaN(parsed.getTime())
                        ? String(ele[key])
                        : parsed.toLocaleString();
                }
            } else if (NUMBER_FIELDS.includes(key)) {
                acc[mappings[key]] = ele[key] ?? 0;
            } else {
                acc[mappings[key]] = ele[key] ?? "";
            }
            return acc;
        }, {})
    );
};
