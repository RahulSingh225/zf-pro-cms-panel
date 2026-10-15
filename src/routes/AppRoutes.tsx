import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute";
import PublicRoute from "../routes/PublicRoute";
import NotFound from "../pages/NotFound";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import UserRoleManagement from "../pages/role-management/UserRoleManagement";
import Qr from "../pages/qr-management/Qr-management";
import Tickets from "../pages/tickets/tickets";
import ProcessManagement from "../pages/process-management/Processmanagement";
import Integrations from "../pages/integrations/Integrations";
import MisAnalytics from "../pages/mis-analytics/MsiAnalytics";
import Reports from "../pages/mis-analytics/reports/Reports";
import DataExport from "../pages/data-export/DataExport";
import MembersManagment from "../pages/members-and-kyc/MembersManagement";
import Communication from "../pages/communication/Communication";
import AmazonMarketplace from "../pages/amazon-marketplace/AmazonMarketplace";
import Faqs from "../pages/faqs/Faqs";
import SurveyQuestions from "../pages/surveys/SurveyQuestions";
import SurveyResponses from "../pages/surveys/SurveyResponses";
import Categories from "../pages/sku-management/categories/Categories";
import SubCategories from "../pages/sku-management/subcategories/Subcategories";
import Skus from "../pages/sku-management/skus/Skus";
import ShockReplacementSkus from "../pages/sku-management/shock-replacement-skus/ShockReplacementSkus";
import Assets from "../pages/assets/Assets";
import ManageWorkshopPage from "../pages/manage-workshop/ManageWorkshopPage";
import DeleteAccount from "../pages/delete-account/DeleteAccount";
import AdminDeleteAccountPage from "../pages/delete-account/AdminDeleteAccountPage";
import ServiceConfig from "../pages/service-config/ServiceConfig";
import PriceListManagement from "../pages/price-list/PriceListManagement";

import { useAppSelector } from "../redux/hooks";
import { getAllowedRoutes } from "../values/roleModuleRules";

export const appRoutes = [
    { path: "/", element: <PublicRoute element={<Login />} />, isPublic: true },
    { path: "/dashboard", element: <PrivateRoute element={<Dashboard />} />, moduleId: "dashboard" },
    { path: "/role-management", element: <PrivateRoute element={<UserRoleManagement />} />, moduleId: "role-management" },
    { path: "/qr", element: <PrivateRoute element={<Qr />} />, moduleId: "qr-management" },
    { path: "/tickets", element: <PrivateRoute element={<Tickets />} />, moduleId: "tickets" },
    { path: "/process-management", element: <PrivateRoute element={<ProcessManagement />} />, moduleId: "process" },
    { path: "/integrations", element: <PrivateRoute element={<Integrations />} />, moduleId: "integrations" },
    { path: "/mis-analytics", element: <PrivateRoute element={<MisAnalytics />} />, moduleId: "mis-analytics" },
    { path: "/reports", element: <PrivateRoute element={<Reports />} />, moduleId: "mis-analytics" },
    { path: "/data-export", element: <PrivateRoute element={<DataExport />} />, moduleId: "data-export" },
    { path: "/members-management", element: <PrivateRoute element={<MembersManagment />} />, moduleId: "members" },
    { path: "/communication", element: <PrivateRoute element={<Communication />} />, moduleId: "communication" },
    { path: "/amazon-marketplace", element: <PrivateRoute element={<AmazonMarketplace />} />, moduleId: "amazon-marketplace" },
    { path: "/faqs", element: <PrivateRoute element={<Faqs />} />, moduleId: "faqs" },
    { path: "/assets-management", element: <PrivateRoute element={<Assets />} />, moduleId: "assets" },
    { path: "/manage-workshop", element: <PrivateRoute element={<ManageWorkshopPage />} />, moduleId: "manage-workshop" },
    { path: "/survey-questions", element: <PrivateRoute element={<SurveyQuestions />} />, moduleId: "surveys" },
    { path: "/survey-responses", element: <PrivateRoute element={<SurveyResponses />} />, moduleId: "surveys" },
    { path: "/categories", element: <PrivateRoute element={<Categories />} />, moduleId: "sku-management" },
    { path: "/categories/:categoryId/subcategories", element: <PrivateRoute element={<SubCategories />} />, moduleId: "sku-management" },
    { path: "/subcategories/:subcategoryId/skus", element: <PrivateRoute element={<Skus />} />, moduleId: "sku-management" },
    { path: "/shock-replacement-skus", element: <PrivateRoute element={<ShockReplacementSkus />} />, moduleId: "shock-replacement-skus" },
    { path: "/admin-delete-account", element: <PrivateRoute element={<AdminDeleteAccountPage />} />, moduleId: "delete-account" },
    { path: "/delete-account", element: <DeleteAccount />, isPublic: true },
    { path: "/service-config", element: <PrivateRoute element={<ServiceConfig />} />, moduleId: "service-config" },
    { path: "/price-list", element: <PrivateRoute element={<PriceListManagement />} />, moduleId: "price-list" },

    { path: "*", element: <NotFound />, isPublic: true },
];

const AppRoutes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.userData);
    const lastValidRouteRef = useRef<string>("/dashboard");

    useEffect(() => {
        const currentPath = location.pathname;
        const isPublicRoute = appRoutes.filter(route => route.isPublic).some(route => route.path === currentPath);

        if (isPublicRoute || currentPath === "/") {
            return;
        }

        if (user?.userRoleId) {
            const allowedRoutes = getAllowedRoutes(user.userRoleId);
            const isAllowed = allowedRoutes.filter(route => currentPath === route || currentPath.startsWith(route.split(":")[0])).length > 0;

            if (isAllowed) {
                // Update last valid route if current route is authorized
                lastValidRouteRef.current = currentPath;
            } else {
                // Redirect to last valid route or dashboard if unauthorized
                const fallbackRoute = lastValidRouteRef.current || "/dashboard";
                navigate(fallbackRoute, { replace: true });
            }
        }
    }, [location.pathname, user?.userRoleId, navigate]);

    return (
        <Routes>
            {appRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
            {appRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};

export default AppRoutes;