// RBAC Configuration - Role-based module access

// Map module IDs to their routes
export const moduleRoutes: Record<string, string[]> = {
  dashboard: ["/dashboard"],
  "qr-management": ["/qr"],
  communication: ["/communication"],
  "mis-analytics": ["/mis-analytics", "/reports"],
  "data-export": ["/data-export"],
  "role-management": ["/role-management"],
  process: ["/process-management"],
  tickets: ["/tickets"],
  members: ["/members-management"],
  faqs: ["/faqs"],
  assets: ["/assets-management"],
  "manage-workshop": ["/manage-workshop"],
  "amazon-marketplace": ["/amazon-marketplace"],
  surveys: ["/survey-questions", "/survey-responses"],
  "survey-questions": ["/survey-questions"],
  "survey-responses": ["/survey-responses"],
  "sku-management": ["/categories", "/categories/:categoryId/subcategories", "/subcategories/:subcategoryId/skus"],
  "shock-replacement-skus": ["/shock-replacement-skus"],
  integrations: ["/integrations"],
  "delete-account": ["/admin-delete-account"],
  "service-config": ["/service-config"],
  "price-list": ["/price-list"],
};

const allModules = Object.keys(moduleRoutes);
// service-config is restricted to Evolve Admin only; all other "all-access" roles get everything else.
const allModulesExceptServiceConfig = allModules.filter(m => m !== 'service-config' && m !== 'price-list');

// Define which modules are accessible by each role
export const roleModuleAccess: Record<number, string[]> = {
  1: [],// mechanic
  2: ["dashboard", "mis-analytics", "data-export", "process", "members"], // regional_manager
  3: ["dashboard", "communication", "mis-analytics", "data-export", "tickets"], // call_centre_executive
  4: ["dashboard", "mis-analytics", "data-export", "process", "members", "qr-management", "communication", "manage-workshop"], // marketing_manager or client admin are same
  5: allModulesExceptServiceConfig, // operator
  6: allModulesExceptServiceConfig, // viewer
  7: ["dashboard", "qr-management"], // qr_admin
  8: allModules, // evolve_admin — only role that can see Service Config
  9: ["dashboard", "qr-management", "communication", "mis-analytics", "data-export", "process", "members", "manage-workshop"], // client_admin
};


// Get allowed routes for a specific roleId
export const getAllowedRoutes = (roleId: number | string | null | undefined): string[] => {
  if (!roleId) return [];

  const roleIdNum = Number(roleId);
  const allowedModules = roleModuleAccess[roleIdNum] || [];

  const allowedRoutes: string[] = [];
  allowedModules.forEach(moduleId => {
    const routes = moduleRoutes[moduleId];
    if (routes) {
      allowedRoutes.push(...routes);
    }
  });

  return allowedRoutes;
};

// Get allowed modules for a specific roleId
export const getAllowedModules = (roleId: number | string | null | undefined): string[] => {
  if (!roleId) return [];
  const roleIdNum = Number(roleId);
  return roleModuleAccess[roleIdNum] || [];
};

