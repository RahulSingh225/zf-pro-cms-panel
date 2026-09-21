import axios, { AxiosInstance } from "axios";
import { handleAuthError } from "../utils/authHandler";
import { Persistance } from "./storage.service";
import store, { RootState } from "../redux/store";
import { LoginPayload } from "../types";
import { API_LINK } from '../values/constants';

export const api: AxiosInstance = axios.create({
    baseURL: API_LINK,
    headers: {
        'Content-Type': 'application/json',
    },
});

const api2: AxiosInstance = axios.create({
    baseURL: API_LINK,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const state: RootState = store.getState();
        const accessToken = state.authToken.accessToken;
        const tempToken = state.authToken.tempToken;
        const tokenToUse = accessToken || tempToken;

        // console.log('API Request:', {
        //     url: config.url,
        //     method: config.method,
        //     tokenUsed: tokenToUse ? (accessToken ? 'accessToken' : 'tempToken') : 'none',
        //     tokenValue: tokenToUse,
        // });

        if (tokenToUse /* && config.headers?.set */) {
            config.headers.set('Authorization', `Bearer ${tokenToUse}`);
        }

        let userId = '';
        try {
            const storedUser = await Persistance.retrieveData('userData');
            userId = storedUser?.userId?.toString() || '';
        } catch (err) {
            // console.warn('Error fetching userId from persistence:', err);
        }

        // if (config.headers?.set) {
        //     config.headers.set('source', 'zf-web-cms');
        //     config.headers.set('userid', userId);
        //     config.headers.set('app-version', '');
        //     config.headers.set('build-version', '');
        //     config.headers.set('latitude', '');
        //     config.headers.set('longitude', '');
        // }

        // console.log('Headers Sent:', {
        //     Authorization: tokenToUse ? `Bearer ${tokenToUse}` : '',
        //     source: 'honeywell-genetron',
        //     userid: userId,
        //     'app-version': VersionNumber.appVersion || '',
        //     'build-version': String(VersionNumber.buildVersion || ''),
        //     latitude: '',
        //     longitude: '',
        // });

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => handleAuthError(error, api)
);

export const userLogin = async (payload: LoginPayload) => {
    const res = await api.post("auth/signin", payload);
    return res?.data;
}

export const refreshAuthToken = async (token: string) => {
    const body = {
        token,
        type: "zf-loyalty-mobile",
    };
    try {
        const response = await api2.post('auth/refresh-token', body);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};


// Generic: Get member count by passing any query params
export const getMemberCount = async (params: any) => {
    return api
        .get('user/count', { params })
        .then((response) => response);
};

export const getScannedPoints = async (params: any) => {
    return api
        .get('masters/points/scanned', { params })
        .then((response) => response);
};

export const getRedeemedPoints = async (params: any) => {
    return api
        .get('masters/points/redeemed', { params })
        .then((response) => response);
};

export const getTotalScans = async (params: any) => {
    return api
        .get('masters/scans/total', { params })
        .then((response) => response);
};

export const getKycStatus = async (params: any) => {
    return api
        .get('masters/kyc/status', { params })
        .then((response) => response);
};

export const getExecutiveStats = async (params?: any) => {
    return api
        .get('masters/executive-stats', { params })
        .then((response) => response);
};

export const getProgramPerformanceStats = async (params?: any) => {
    return api
        .get('masters/program-performance-stats', { params })
        .then((response) => response);
};

export const getProductSkuStats = async (params?: any) => {
    return api
        .get('masters/product-sku-stats', { params })
        .then((response) => response);
};

export const getZonePerformance = async (params?: any) => {
    return api
        .get('masters/zone-performance', { params })
        .then((response) => response);
};

export const getRewardsStats = async (params?: any) => {
    return api
        .get('masters/rewards-stats', { params })
        .then((response) => response);
};

export const getGeographyStats = async (params?: any) => {
    return api
        .get('masters/geography-stats', { params })
        .then((response) => response);
};

// Get member registration graph data
export const getUserRegistrations = async (params: { [key: string]: any }) => {
    return api
        .get("masters/users/registered", { params })
        .then((response) => response);
};

// Get points graph data (bar chart)
export const getPointsGraph = async (params: { [key: string]: any }) => {
    return api
        .get("masters/points/points-graph", { params })
        .then((response) => response);
};

// Get recent points transactions
export const getRecentTransactions = async (count: number) => {
    return api
        .get("masters/points/recent-transactions", {
            params: { count }
        })
        .then((response) => response);
};

export const getAssets = async () => {
    return api
        .get("masters/assets")
        .then((response) => response)
        .catch((error) => { throw error });
};

export const addAsset = async (payload: { assetType: string; assetTitle: string; assetDescription: string; file?: File; fileUrl?: string }) => {
    const formData = new FormData();
    formData.append('assetType', payload.assetType);
    formData.append('assetTitle', payload.assetTitle);
    formData.append('assetDescription', payload.assetDescription);
    if (payload.file) {
        formData.append('file', payload.file);
    }
    if (payload.fileUrl) {
        formData.append('staticAssetUrl', payload.fileUrl);
    }
    return api.post('masters/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
        .then((response) => response)
        .catch((error) => { throw error });
};

export const editAsset = async (
    assetId: number,
    payload: { assetType?: string; assetTitle: string; assetDescription?: string; isActive?: boolean }
) => {
    const formData = new FormData();
    if (payload.assetType) formData.append('assetType', payload.assetType);
    formData.append('assetTitle', payload.assetTitle);
    if (payload.assetDescription) formData.append('assetDescription', payload.assetDescription);
    if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));
    return api.put(`masters/assets/${assetId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
        .then((response) => response)
        .catch((error) => { throw error });
};

export const deleteAsset = async (assetId: number) => {
    return api
        .delete(`masters/assets/${assetId}`)
        .then((response) => response);
};

// Get top performers
export const getTopPerformers = async (count: number) => {
    return api
        .get("masters/users/top-performers", {
            params: { count }
        })
        .then((response) => response);
};

// Get top mechanics
export const getTopMechanics = async (count: number = 5) => {
    return api
        .get("masters/users/top-mechanics", {
            params: { count }
        })
        .then((response) => response);
};

// Get top dealers
export const getTopDealers = async (count: number = 5) => {
    return api
        .get("masters/users/top-workshops", {
            params: { count }
        })
        .then((response) => response);
};

// Get top products
export const getTopProducts = async (count: number = 5) => {
    return api
        .get("masters/inventory/top-products", {
            params: { count }
        })
        .then((response) => response);
};

// Get regional sales performance graph
export const getRegionalSalesPerformance = async (params?: { [key: string]: any }) => {
    return api
        .get("masters/sales/regional", { params })
        .then((response) => response);
};

// Get sales by product category
export const getSalesByCategory = async (params?: { [key: string]: any }) => {
    return api
        .get("masters/sales/category", { params })
        .then((response) => response);
};

// Get scans by product
export const getScansByProduct = async (count: number = 5) => {
    return api
        .get("masters/scans/by-product", { params: { count } })
        .then((response) => response);
};

// Get category share (pie chart)
export const getCategoryShare = async () => {
    return api
        .get("masters/scans/category-share")
        .then((response) => response);
};

// Get product scan heatmap by zone
export const getProductHeatmapByZone = async (count: number = 5) => {
    return api
        .get("masters/scans/product-heatmap", { params: { count } })
        .then((response) => response);
};

// Get most redeemed rewards
export const getMostRedeemedRewards = async (count: number = 5) => {
    return api
        .get("masters/rewards/most-redeemed", { params: { count } })
        .then((response) => response);
};

// Get State member density
export const getStateMemberDensity = async () => {
    return api
        .get("masters/geography/state-member-density")
        .then((response) => response);
};

// Get Density by state
export const getDensityByState = async () => {
    return api
        .get("masters/geography/density-by-state")
        .then((response) => response);
};

// Get Member 360 list
export const getMember360List = async (search?: string, page: number = 1, limit: number = 10) => {
    return api
        .get("masters/members/360-list", { params: { search, page, limit } })
        .then((response) => response);
};

// Get Member 360 detail
export const getMember360Detail = async (userId: number) => {
    return api
        .get(`masters/members/360-detail/${userId}`)
        .then((response) => response);
};

// Get Points Issued vs Redeemed monthly graph data
export const getPointsIssuedVsRedeemedMonthly = async () => {
    return api
        .get("masters/mis/points-issued-vs-redeemed")
        .then((response) => response);
};

// Get Top Mechanics by Zone
export const getTopMechanicsByZone = async () => {
    return api
        .get("masters/mis/top-mechanics-by-zone")
        .then((response) => response);
};

// Get user status distribution (active/inactive/dormant)
export const getUserStatusDistribution = async () => {
    return api
        .get("masters/users/status-distribution")
        .then((response) => response);
};

export const getAllSkus = async () => {
    return api
        .get("sku/skus")
        .then((response) => response);
};

export const getActiveSkus = async () => {
    return api
        .get("sku/active")
        .then((response) => response);
};

export const getShockReplacementSkus = async () => {
    return api
        .get("sku/shock-replacement-config")
        .then((response) => response);
};

export const addShockReplacementSku = async (
    payload:
        | { sku: number | string; sku_code?: number | string }
        | { sku: number | string; quantity: number }[]
) => {
    return api
        .post("sku/shock-replacement-config", payload)
        .then((response) => response);
};

export const removeShockReplacementSku = async (sku: number | string) => {
    return api
        .delete(`sku/shock-replacement-config/${sku}`)
        .then((response) => response);
};

export const getSubcategoriesBySku = async (skuId: number) => {
    return api
        .get(`sku/skus/${skuId}/subcategories`)
        .then((response) => response);
};

export const getCategories = async (page: number = 1, limit: number = 10) => {
    return api.get("sku/categories/all", { params: { page, limit } }).then((res) => res);
};

export const getSubcategoriesByCategory = async (categoryId: number, page: number = 1, limit: number = 10) => {
    return api.get(`sku/categories/${categoryId}/subcategories/all`, { params: { page, limit } }).then((res) => res);
};

export const getCategoryHistory = async (categoryId: number, page: number = 1, limit: number = 10) => {
    return api.get(`sku/categories/${categoryId}/history`, { params: { page, limit } }).then((res) => res);
};

export const getSubCategoryHistory = async (subCategoryId: number, page: number = 1, limit: number = 10) => {
    return api.get(`sku/subcategories/${subCategoryId}/history`, { params: { page, limit } }).then((res) => res);
};

export const getAllSubcategories = async (page: number = 1, limit: number = 10) => {
    return api.get(`sku/subcategories/all`, { params: { page, limit } }).then((res) => res);
};

export const editCategory = async (categoryId: number, payload: any) => {
    return api.put(`sku/categories/${categoryId}`, payload).then((res) => res);
};

export const addCategory = async (payload: {
    categoryName: string;
    categoryShortCode: string;
    categoryDescription: string;
}) => {
    return api.post(`sku/categories`, payload).then((res) => res);
};

export const addBulkCategories = async (payload: any[]) => {
    return api.post(`sku/categories/bulk`, payload).then((res) => res);
};

export const checkCategoryShortCode = async (shortCode: string) => {
    return api.get(`sku/categories/check-shortcode`, { params: { shortCode } }).then((res) => res);
};

export const editSubcategory = async (subCategoryId: number, payload: any) => {
    return api.put(`sku/subcategories/${subCategoryId}`, payload).then((res) => res);
};

export const addSubcategory = async (payload: {
    categoryId: number;
    subCategoryName: string;
    subCategoryDescription: string;
}) => {
    return api.post(`sku/subcategories`, payload).then((res) => res);
};

export const addBulkSubcategories = async (payload: any[]) => {
    return api.post(`sku/subcategories/bulk`, payload).then((res) => res);
};

export const editSku = async (skuId: number, payload: { skuName: string; skuDescription: string; isActive: boolean }) => {
    return api.put(`sku/skus/${skuId}`, payload).then((res) => res);
};

export const addSku = async (payload: {
    skuName: string;
    skuCode: string;
    skuDescription: string;
    productValue: string;
    points: string;
    categoryId: number;
    subCategoryId: number;
}[]) => {
    return api.post(`sku/skus`, payload).then((res) => res);
};

export const addBulkSkus = async (payload: any[]) => {
    return api.post(`sku/skus/bulk`, payload).then((res) => res);
};

export const getSkusBySubcategory = async (subCategoryId: number, page: number = 1, limit: number = 10) => {
    return api.get(`sku/subcategories/${subCategoryId}/skus/all`, { params: { page, limit } }).then((res) => res);
};

export const getSkuHistory = async (skuId: number, page: number = 1, limit: number = 10) => {
    return api.get(`sku/skus/${skuId}/history`, { params: { page, limit } }).then((res) => res);
};

export const getSkusByCategoryAndSubcategory = async (
    categoryId: number,
    subCategoryId: number
) => {
    return api
        .get(`sku/categories/${categoryId}/subcategories/${subCategoryId}/skus`)
        .then((res) => res);
};

export const generateQRCodes = async (quantity: number, skuCode: string) => {
    return api.post("qr/qrs", {
        quantity,
        skuCode,
    });
};

export const getQRHistory = async (params: any = {}) => {
    return api
        .get("qr/qrs/history", { params })
        .then((response) => response);
};

export const getQRFile = async (batchId: number) => {
    return api
        .get(`qr/qrs/file`, { params: { batchId } })
        .then((response) => response);
};

export const getTotalGenerated = async () => {
    return api
        .get("masters/inventory/total-count")
        .then((response) => response);
};

export const getTicketCountByStatus = async (status?: string) => {
    const url = status
        ? `masters/tickets/count/status/${status}`
        : `masters/tickets/count/status`;

    return api
        .get(url)
        .then((response) => response);
};

export const getTickets = async (params: { [key: string]: any }) => {
    return api
        .get("user/tickets", { params })
        .then((response) => response);
};

export const getTicketCategories = async () => {
    return api
        .get("masters/tickets/categories")
        .then((response) => response);
};

export const getTicketStatus = async () => {
    return api
        .get("masters/tickets/statuses")
        .then((response) => response);
};

export const getRoles = async () => {
    return api
        .get("user/roles")
        .then((response) => response);
};


export const getRedemptionHistory = async (payload: any) => {
    return api
        .post("redeem/history", payload)
        .then((res) => res.data);
};

export const updateRedemptionStatus = async (payload: any) => {
    return api
        .patch("redeem/history", payload)
        .then((response) => response)
        .catch((error) => { throw error });
};

export const getApplicationLoginReport = (data: any) => {
    return api.post('report/application-login', data);
};

export const getregisteredUsersReport = (data: any) => {
    return api.post('report/registered-users', data);
};

export const getQrTransactionReport = (data: any) => {
    return api.post('report/qr-transaction', data);
};

export const getAdminreferralReport = (data: any) => {
    return api.post('report/admin-referal-history', data);
};

export const getUserProfile = () => {
    return api.get('user/user-profile');
};

export const userLogout = () => {
    return api.get('auth/user-logout');
};

export const deleteAccount = async (payload: {
    username: string;
    password: string;
    details?: string;
    confirmText: string;
}) => {
    return api.post("user/delete-account", payload);
};

export const resolveTicket = async (ticketId: number, comments: string) => {
    const payload = [
        {
            ticketId,
            resolvedComments: comments
        }
    ];
    return api.post("user/resolve-ticket", payload);
};

export const assignTicket = async (ticketId: number, roleId: number) => {
    const payload = [
        {
            roleId,
            ticketId
        }
    ];
    return api.post("user/assign-ticket", payload);
};

export const getTicketImage = async (ticketId: number) => {
    return api.get(`user/tickets/image?ticketId=${ticketId}`);
};

export const getUserCount = async (params: string) => {
    return api.get(`user/count?${params}`);
};

export const getUserList = async (filters: {
    status?: string;
    role?: number[];
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (filters.status) query.append("status", filters.status);
    if (filters.search) query.append("search", filters.search);
    if (filters.page !== undefined) query.append("page", String(filters.page));
    if (filters.limit !== undefined) query.append("limit", String(filters.limit));
    if (filters.role && filters.role.length > 0) {
        filters.role.forEach(r => query.append("role", String(r)));
    }
    return api.get(`user/list?${query.toString()}`);
};

export const getUserActivityLogs = async (filters: {
    activityType?: "login" | "logout";
    userId?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (filters.activityType) query.append("activityType", filters.activityType);
    if (filters.userId !== undefined) query.append("userId", String(filters.userId));
    if (filters.fromDate) query.append("fromDate", filters.fromDate);
    if (filters.toDate) query.append("toDate", filters.toDate);
    if (filters.search) query.append("search", filters.search);
    if (filters.page !== undefined) query.append("page", String(filters.page));
    if (filters.limit !== undefined) query.append("limit", String(filters.limit));
    return api.get(`user/activity/logs?${query.toString()}`);
};

export const getUserRoles = async () => {
    return api.get(`user/roles`);
};

export const activateUser = async (userId: number) => {
    return api.patch(`user/${userId}/activate`);
};

export const deactivateUser = async (userId: number) => {
    return api.patch(`user/${userId}/deactivate`);
};

export const editUser = async (userId: number, payload: any) => {
    return api.put(`user/users/${userId}`, payload);
};

export const getActivityLogs = async (filters: {
    fromDate?: string;
    toDate?: string;
    activityType?: "login" | "logout";
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();
    if (filters.fromDate) query.append("fromDate", filters.fromDate);
    if (filters.toDate) query.append("toDate", filters.toDate);
    if (filters.activityType) query.append("activityType", filters.activityType);
    if (filters.search && filters.search.trim().length >= 3) {
        query.append("search", filters.search);
    }
    if (filters.page !== undefined) query.append("page", String(filters.page));
    if (filters.limit !== undefined) query.append("limit", String(filters.limit));
    return api.get(`user/activity/logs?${query.toString()}`);
};

export const addUser = (data: any) => {
    return api.post('user/addUser', data);
};

export const getUserKycsByUserId = async (userId: number, page: number, limit: number) => {
    return api.get(`kyc/kycs`, {
        params: { userId, page, limit }
    });
};

export const updateKycRecords = async (updates: { detailId: number; status: "Approved" | "Rejected" | "Completed"; comment?: string }[]) => {
    return api.post(`kyc/updateKycRecords`, {
        updates
    });
};

export const raiseTicket = async (
    ticketId: string,
    description: string,
    userId: string,
    ticketImage: File | Blob
) => {
    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("description", description);
    formData.append("userId", userId);
    formData.append("ticket", ticketImage);
    return api.post("user/raise-ticket", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
};

export const getAdminOtpReport = (params: any) => {
    return api.get("report/otp-report", { params });
};

export const bulkProductScan = async (items: { userCode: string; payload: { qr: string } }[]) => {
    return api
        .post("qr/bulk-product-scan", { items })
        .then((response) => response?.data)
        .catch((error) => { throw error });
};

export const bulkRedeemPoints = async (
    items: { userCode: string; payload: { type: string; value: number } }[]
) => {
    return api
        .post("redeem/bulk-redeem-points", { items })
        .then((response) => response?.data)
        .catch((error) => { throw error });
};

// Amazon Marketplace
export const getAmazonProducts = async (payload: { limit: number; skip: number }) => {
    return api
        .post("amazon-market/products", payload)
        .then((response) => response?.data);
};

export const editAmazonProduct = async (formData: FormData) => {
    return api
        .post("amazon-market/edit-product", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then((response) => response?.data);
};

export const addAmazonProducts = async (data: any[]) => {
    return api
        .post("amazon-market/add-products", data)
        .then((response) => response?.data);
};

export const getDeliveryStatuses = async () => {
    return api.get("amazon-market/delivery-statuses").then((res) => res?.data);
};

export const updateDeliveryStatus = async (payload: { status: string; redemptionId: number }) => {
    return api.post("amazon-market/update-delivery-status", payload).then((res) => res?.data);
};

export const getFaqs = async () => {
    return api
        .get("masters/faqs")
        .then((response) => response)
        .catch((error) => { throw error });
};

export const addFaq = async (payload: { faqQuestion: string; faqAnswer: string }) => {
    return api
        .post("masters/faqs", payload)
        .then((response) => response)
        .catch((error) => { throw error });
};

export const deleteFaq = async (faqId: number) => {
    return api
        .delete(`masters/faqs/${faqId}`)
        .then((response) => response);
};

// // Amazon Marketplace
// export const getAmazonProducts = async (payload: { limit: number; skip: number }) => {
//     return api
//         .post("amazon-market/products", payload)
//         .then((response) => response?.data);
// };

// export const editAmazonProduct = async (formData: FormData) => {
//     return api
//         .post("amazon-market/edit-product", formData, {
//             headers: {
//                 "Content-Type": "multipart/form-data",
//             },
//         })
//         .then((response) => response?.data);
// };

// export const addAmazonProducts = async (data: any[]) => {
//     return api
//         .post("amazon-market/add-products", data)
//         .then((response) => response?.data);
// };

// export const getDeliveryStatuses = async () => {
//     return api.get("amazon-market/delivery-statuses").then((res) => res?.data);
// };

// export const updateDeliveryStatus = async (payload: { status: string; redemptionId: number }) => {
//     return api.post("amazon-market/update-delivery-status", payload)
//         .then((response) => response)
//         .catch((error) => { throw error });
// };

// Survey Module
export const getSurveyQuestions = async () => {
    return api
        .get("surveys/questions")
        .then((response) => response)
        .catch((error) => { throw error });
};

export const createSurveyQuestion = async (payload: { questionText: string; answerType: string; options: string[] }) => {
    return api
        .post("surveys/questions", payload)
        .then((response) => response)
        .catch((error) => { throw error });
};

export const deleteSurveyQuestion = async (id: number) => {
    return api
        .delete(`surveys/questions/${id}`)
        .then((response) => response)
        .catch((error) => { throw error });
};

export const getSurveyResults = async () => {
    return api
        .get("surveys/results")
        .then((response) => response)
        .catch((error) => { throw error });
};

export const getBankDetailsReport = (data: any) => {
    return api.post('report/bank-details-report', data);
};

export const getKycReport = (data: any) => {
    return api.post('report/kyc-report', data);
};

export const getProductWiseReport = (data: any) => {
    return api.post('report/product-wise-report', data);
};

export const getCategoryReport = (data: any) => {
    return api.post('report/category-report', data);
};

export const getErrorTransactionReport = (data: any) => {
    return api.post('report/error-transaction-report', data);
};

export const getNotificationReport = (data: any) => {
    return api.post('report/notification-report', data);
};

export const getBlockedMemberReport = (data: any) => {
    return api.post('report/blocked-member-report', data);
};

export const getBlockedMemberQrScanReport = (data: any) => {
    return api.post('report/blocked-member-qr-scan-report', data);
};

export const getAnomalyTransactionsReport = (data: any) => {
    return api.post('report/anomaly-transactions-report', data);
};

export const getShockReplacementReport = (data: any) => {
    return api.post('report/shock-replacement-report', data);
};

export const getNotifications = async (params?: any) => {
    return api.get("notifications", { params }).then((res) => res?.data);
};

export const getNotificationRoles = async () => {
    return api.get("notifications/filters/roles").then((res) => res?.data);
};

export const getNotificationStates = async () => {
    return api.get("notifications/filters/states").then((res) => res?.data);
};

export const getNotificationDistricts = async (states: string[]) => {
    const params = new URLSearchParams();
    states.forEach(state => params.append("state", state));
    return api.get(`notifications/filters/districts?${params.toString()}`).then((res) => res?.data);
};

export const getNotificationCities = async (districts: string[]) => {
    const params = new URLSearchParams();
    districts.forEach(district => params.append("district", district));
    return api.get(`notifications/filters/cities?${params.toString()}`).then((res) => res?.data);
};

export const getNotificationPincodes = async (cities: string[]) => {
    const params = new URLSearchParams();
    cities.forEach(city => params.append("city", city));
    return api.get(`notifications/filters/pincodes?${params.toString()}`).then((res) => res?.data);
};

export const getNotificationBlockStatuses = async () => {
    return api.get(`notifications/filters/block-statuses`).then((res) => res?.data);
};

export const getNotificationUserCount = async (payload: {
    roleFilter?: number[];
    stateFilter?: string[];
    districtFilter?: string[];
    cityFilter?: string[];
    pincodeFilter?: number[];
    blockStatusFilter?: string[];
}) => {
    return api.post(`notifications/users/count`, payload).then((res) => res?.data);
};

export const broadcastNotification = async (payload: {
    title: string;
    body: string;
    file?: File | null;
    redirectionLink?: string;
    roleFilter?: string;       // comma-separated IDs e.g. "1,2"
    stateFilter?: string;      // comma-separated state names
    districtFilter?: string;
    cityFilter?: string;
    pincodeFilter?: string;    // comma-separated pincodes
    blockStatusFilter?: string;
    scheduledAt?: string;      // ISO string
    type?: string;
    startDate?: string;
    endDate?: string;
    scheduledTime?: string;
    recurrence?: string;
}) => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('body', payload.body);
    if (payload.file) form.append('file', payload.file);
    if (payload.redirectionLink) form.append('redirectionLink', payload.redirectionLink);
    if (payload.roleFilter) form.append('roleFilter', payload.roleFilter);
    if (payload.stateFilter) form.append('stateFilter', payload.stateFilter);
    if (payload.districtFilter) form.append('districtFilter', payload.districtFilter);
    if (payload.cityFilter) form.append('cityFilter', payload.cityFilter);
    if (payload.pincodeFilter) form.append('pincodeFilter', payload.pincodeFilter);
    if (payload.blockStatusFilter) form.append('blockStatusFilter', payload.blockStatusFilter);
    if (payload.scheduledAt) form.append('scheduledAt', payload.scheduledAt);
    if (payload.type) form.append('type', payload.type);
    if (payload.startDate) form.append('startDate', payload.startDate);
    if (payload.endDate) form.append('endDate', payload.endDate);
    if (payload.scheduledTime) form.append('scheduledTime', payload.scheduledTime);
    if (payload.recurrence) form.append('recurrence', payload.recurrence);
    return api.post('notifications/broadcast', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res?.data);
};

export const getNotificationLogs = async (notificationId: number, page: number = 1, limit: number = 10) => {
    return api.get(`notifications/${notificationId}/logs`, { params: { page, limit } }).then((res) => res?.data);
};

export const getNotificationMediaUrl = async (notificationId: number) => {
    return api.get(`notifications/${notificationId}/media-url`).then((res) => res?.data);
};

export const getCampaigns = async (
    page: number = 1,
    limit: number = 10,
    filters: {
        status?: string;
        recurrence?: string;
        search?: string;
        startFrom?: string;
        startTo?: string;
        endFrom?: string;
        endTo?: string;
    } = {}
) => {
    const params: Record<string, any> = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.recurrence) params.recurrence = filters.recurrence;
    if (filters.search) params.search = filters.search;
    if (filters.startFrom) params.startFrom = filters.startFrom;
    if (filters.startTo) params.startTo = filters.startTo;
    if (filters.endFrom) params.endFrom = filters.endFrom;
    if (filters.endTo) params.endTo = filters.endTo;
    return api.get('notifications/campaigns', { params }).then((res) => res?.data);
};

export const getCampaignNotifications = async (
    campaignId: number,
    page: number = 1,
    limit: number = 10,
    filters: {
        status?: string;
        scheduledFrom?: string;
        scheduledTo?: string;
    } = {}
) => {
    const params: Record<string, any> = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.scheduledFrom) params.scheduledFrom = filters.scheduledFrom;
    if (filters.scheduledTo) params.scheduledTo = filters.scheduledTo;
    return api.get(`notifications/campaigns/${campaignId}/notifications`, { params }).then((res) => res?.data);
};

// ─── Workshop (Retailer) APIs ──────────────────────────────────────────────────

export const getWorkshops = async (params: {
    page: number;
    limit: number;
    search?: string;
}) => {
    return api.get('masters/workshops', { params });
};

export const getWorkshopById = async (id: number) => {
    return api.get(`masters/workshops/${id}`);
};

export const bulkCreateWorkshops = async (
    items: {
        store_name: string;
        retailer_name: string;
        mobile_number: string;
        current_address: string;
        current_pincode?: number;
    }[]
) => {
    return api.post('masters/add-workshops', items);
};

export const updateWorkshop = async (
    retailerId: number,
    payload: {
        store_name?: string;
        retailer_name?: string;
        mobile_number?: string;
        current_pincode?: number | string;
        current_address?: string;
    }
) => {
    return api.put(`masters/workshops/${retailerId}`, payload);
};

export const updateMechanicPreferredRetailer = async (
    userId: number,
    retailerId: number | null
) => {
    return api.put(`masters/mechanics/${userId}/preferred-retailer`, { retailerId });
};

export const searchWorkshops = async (search: string) => {
    return api.get('masters/workshops', { params: { page: 1, limit: 10000, search } });
};

export const deleteUserAccount = async (mobile: string) => {
    return api.delete('user/delete-account', { data: { mobile } });
};

export const deleteAccountPreview = async (mobile: string) => {
    return api.post('user/delete-account/preview', { mobile });
};


// ─── Service Config (Evolve Admin only) ──────────────────────────────────────

export const getDigilockerProviderConfig = async () => {
    return api.get('masters/digilocker-provider');
};

export const updateDigilockerProviderConfig = async (activeProvider: 'TENACIO' | 'SUREPASS') => {
    return api.put('masters/digilocker-provider', { activeProvider });
};
