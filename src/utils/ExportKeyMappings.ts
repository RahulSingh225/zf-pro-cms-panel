export const ApplicationLoginReportKeys: any = {
    userName: "User Name",
    userCode: "User ID",
    userMobile: "User Mobile",
    firstLogin: "First Login Date & Time",
    lastLogin: "Last Login Date & Time",
    loginDevice: "Login Device",
    logoutDate: "Logout Date & Time",
    welcomePoints: "Welcome Points Earned",
    totalScannedPoints: "Total Scanned Points",
    totalRewardPoints: "Total Reward Points",
    totalRedeemedPoints: "Total Redeemed Points",
    totalBalancePoints: "Total Balance Points",
};

export const RegisteredUsersReportKeys: any = {
    userId: "User ID",
    uniqueCode: "Unique Code",
    roleName: "Role Name",
    status: "Status",
    email: "Email",
    mobileNumber: "Mobile Number",
    fullName: "Full Name",
    aadhaarMasked: "Aadhaar Number (Masking)",
    panNumber: "PAN Number",
    aadhaarStatus: "Aadhaar Verification Status",
    gender: "Gender",
    age: "Age",
    country: "Country",
    state: "State",
    city: "City",
    pincode: "Pincode",
    zone: "Zone",
    mappedRetailers: "Mapped Retailers",
    workshopName: "Workshop Name",
    dateOfJoining: "Date of Joining"
};

export const QRTransactionReportKeys: any = {
    transactionId: "Transaction ID",
    transactionDate: "Transaction Date",
    amount: "Amount",
    paymentStatus: "Payment Status",
    qrCodeId: "QR Code ID",
    partNumber: "Part Number",
    partName: "Part Name",
    userCode: "User ID",
    userName: "User Name",
    gender: "Gender",
    email: "Email",
    phone: "Phone",
    latitude: "Latitude",
    longitude: "Longitude",
    address: "Address",
    city: "City",
    state: "State",
    country: "Country",
    workshopName: "Workshop Name",
};

export const RedemptionReportKeys: any = {
    redemptionRef: "Redemption ID",
    userName: "User Full Name",
    userCode: "User Unique Code",
    redeemedPoints: "Redeemed Points",
    redemptionMode: "Redemption Mode",
    redemptionStatus: "Redemption Status",
    userMobile: "User Mobile Number",
    userRole: "User Type",
    dateOfJoining: "Date of Joining",
    totalEarnedPoints: "Total Earned Points",
    createdAt: "Redemption Request Date",
    redemptionProcessedDate: "Redemption Processed Date",
    redemptionDetails: "Redemption Details",
};

export const ReferralsReportKeys: any = {
    senderUniqueCode: "Sender Unique Code",
    senderMobileNumber: "Sender Mobile Number",
    senderName: "Sender Name",
    receiverUniqueCode: "Receiver Unique Code",
    receiverMobileNumber: "Receiver Mobile Number",
    receiverName: "Receiver Name",
    referralCode: "Referral Code",
    pointsEarnedBySender: "Points Earned by Sender",
    pointsEarnedByReceiver: "Points Earned by Receiver",
    dateOfReferral: "Date of Referral",
};

export const ProcessRedemptionKeys: any = {
    slno: "SL No",
    redemptionRef: "Redemption Ref",
    userName: "User Name",
    userMobile: "User Mobile",
    userRole: "Role",
    redeemedPoints: "Redeemed Points",
    createdAt: "Created At",
    redemptionMode: "Mode",
    redemptionStatus: "Status",
};

export const OtpReportKeys: any = {
    userCode: "User Unique Code",
    otp: "OTP",
    userName: "User Name",
    userMobile: "Mobile",
    userEmail: "Email",
    otpType: "OTP Type",
    isVerified: "Verified",
    expiryAt: "Expiry Time",
    createdAt: "Created At",
    currentCity: "City",
    currentDistrict: "District",
    currentState: "State",
    zoneId: "Zone",
    branchId: "Branch",
};

export const AmazonMarketplaceKeys: any = {
    productId: "Product ID",
    amazonAsinSku: "ASIN/SKU",
    amazonProductName: "Product Name",
    amazonCategory: "Category",
    amazonSubCategory: "Sub Category",
    amazonMrp: "MRP",
    amazonCspPrice: "CSP Price",
    amazonDiscountedPrice: "Discounted Price",
    amazonPoints: "Points",
    amazonCommentsVendor: "Vendor Comments",
    amazonProductDescription: "Description"
};

export const BankDetailsReportKeys: any = {
    userId: "User ID",
    uniqueCode: "Unique Code",
    name: "Name",
    roleName: "Role Name",
    mobileNumber: "Mobile Number",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    ifscCode: "IFSC Code",
    accountType: "Account Type",
    branchName: "Branch Name",
    bankAddress: "Bank Address",
    upiId: "UPI ID"
};

export const KycReportKeys: any = {
    uniqueCode: "Unique Code",
    name: "Name",
    workshopName: "Workshop Name",
    zone: "Zone",
    roleName: "Role Name",
    mobileNumber: "Mobile Number",
    emailId: "Email ID",
    status: "Status",
    dob: "Date of Birth",
    createdAt: "Created At",
    aadhaarNumber: "Aadhaar Number",
    kycDocStatus: "KYC Status"
};

export const ProductWiseReportKeys: any = {
    userId: "User ID",
    memberName: "Member Name",
    workshop: "Workshop",
    zone: "Zone",
    city: "City",
    productCode: "Product Code",
    productCategory: "Product Category",
    productType: "Product Type",
    productDescription: "Product Description",
    userType: "User Type",
    district: "District",
    state: "State",
    scanDate: "Scan Date",
    pointsEarned: "Points Earned"
};

export const CategoryReportKeys: any = {
    categoryName: "Category Name",
    userType: "User Type",
    productsInCategory: "Products in this Category",
    bonusPoints: "Bonus Points",
    bonusPointsActive: "Bonus Points Active"
};

export const ErrorTransactionReportKeys: any = {
    userName: "User Name",
    userMobile: "User Mobile Number",
    dateOfJoining: "Date of Joining",
    userType: "User Type",
    district: "District",
    state: "State",
    scanDate: "Scan Date",
    qrDetails: "QR Details",
    productCode: "Product Code",
    productDescription: "Product Description",
    message: "Message",
    productStatus: "Product Status",
    actionTaken: "Action Taken"
};

export const NotificationReportKeys: any = {
    notificationTitle: "Notification Title",
    notificationMessage: "Notification Message",
    userMobile: "User Mobile Number",
    userName: "User Name",
    userType: "User Type",
    sentVia: "Sent Via",
    deliveredDate: "Delivered Date",
    sentDate: "Sent Date"
};

export const BlockedMemberReportKeys: any = {
    userName: "User Name",
    mobileNumber: "Mobile Number",
    userType: "User Type",
    district: "District",
    state: "State",
    dateOfJoining: "Date of Joining",
    totalEarnedPoints: "Total Earned Points",
    redeemedPoints: "Redeemed Points",
    redemptionRequestDate: "Redemption Request Date",
    redemptionProcessedDate: "Redemption Processed Date",
    redemptionDetails: "Redemption Details",
    upiId: "UPI ID",
    accountNumber: "Account Number",
    accountHolderName: "Account Holder Name",
    ifscCode: "IFSC Code",
    bankName: "Bank Name",
    status: "Status"
};

export const BlockedMemberScanReportKeys: any = {
    userName: "User Name",
    mobileNumber: "Mobile Number",
    district: "District",
    state: "State",
    dateOfJoining: "Date of Joining",
    scanId: "Scan ID",
    dateOfScan: "Date of Scan",
    productCategory: "Product Category",
    productCode: "Product Code",
    productName: "Product Name",
    productDescription: "Product Description",
    qrDetails: "QR Details",
    basePoint: "Base Point",
    extraBonusPoint: "Extra Bonus Point",
    totalPoints: "Total Points",
    scanStatus: "Scan Status"
};

export const AnomalyTransactionsReportKeys: any = {
    referenceId: "Reference ID",
    district: "District",
    state: "State",
    influencerName: "Influencer Name",
    userMobile: "User Mobile Number",
    dateOfJoining: "Date of Joining",
    productQr: "Product QR",
    productCategoryScanned: "Product Category Scanned",
    dateOfScan: "Date of Scan",
    frequencyOfAnomaly: "Frequency of Anomaly",
    anomalyValueScanned: "Anomaly Value Scanned",
    totalPointsEarned: "Total Points Earned",
    totalPointsRedeemed: "Total Points Redeemed",
    totalPointsScanned: "Total Points Scanned",
    firstScanDate: "First Scan Date",
    lastScanDate: "Last Scan Date",
    lastScanId: "Last Scan ID",
    updatedAt: "Updated At",
    actionTaken: "Action Taken"
};

export const CategoriesListKeys: any = {
    categoryId: "Category ID",
    categoryName: "Category Name",
    categoryShortCode: "Short Code",
    categoryDescription: "Description",
    isActive: "Status"
};

export const SubCategoriesListKeys: any = {
    subCategoryId: "SubCategory ID",
    categoryId: "Category ID",
    subCategoryName: "SubCategory Name",
    subCategoryDescription: "Description",
    isActive: "Status"
};

export const ShockReplacementReportKeys: any = {
    id: "Record ID",
    userId: "User ID",
    skuCode: "SKU Code",
    skuName: "SKU Name",
    quantity: "Quantity",
    createdAt: "Created At",
    createdBy: "Created By"
};

export const TicketsListKeys: any = {
    TicketID: "Ticket ID",
    Category: "Category",
    Description: "Description",
    Username: "Username",
    email: "Email",
    mobile: "Mobile",
    roleAssigned: "Role Assigned",
    Status: "Status",
    resolvedComments: "Resolved Comments",
    createdAt: "Created At",
    createdBy: "Created By"
};
