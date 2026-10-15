import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { getAllowedModules } from '../values/roleModuleRules';



interface LayoutProps {
    children: React.ReactNode;
    sidebarProps?: any;
    topBarProps?: any;
}

interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    subItems?: { id: string; label: string; path: string; }[];
}

export const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard' },
    // { id: 'masters-config', label: 'Masters & Config', icon: 'fas fa-cogs', path: '/masters-config' },
    // { id: 'schemes-campaigns', label: 'Schemes & Campaigns', icon: 'fas fa-bullhorn', path: '/schemes-campaigns' },
    { id: 'qr-management', label: 'QR Management', icon: 'fas fa-qrcode', path: '/qr' },
    { id: 'communication', label: 'Communication', icon: 'fas fa-broadcast-tower', path: '/communication' },
    // { id: 'finance-compliance', label: 'Finance & Compliance', icon: 'fas fa-coins', path: '/finance-compliance' },
    // { id: 'fraud-detection', label: 'Fraud Detection', icon: 'fas fa-shield-alt', path: '/fraud-detection' },
    { id: 'mis-analytics', label: 'MIS & Analytics', icon: 'fas fa-chart-line', path: '/mis-analytics' },
    { id: 'data-export', label: 'Data Export', icon: 'fas fa-file-export', path: '/data-export' },
    { id: 'manage-workshop', label: 'Manage Workshop', icon: 'fas fa-store', path: '/manage-workshop' },
    { id: 'role-management', label: 'Role Management', icon: 'fas fa-user-shield', path: '/role-management' },
    // { id: 'integrations', label: 'Integrations', icon: 'fas fa-plug', path: '/integrations' },
    { id: 'process', label: 'Process Redemption', icon: 'fas fa-cogs', path: '/process-management' },
    { id: 'tickets', label: 'Tickets', icon: 'fas fa-ticket-alt', path: '/tickets' },
    { id: 'members', label: 'Members and KYC', icon: 'fas fa-users', path: '/members-management' },
    { id: 'faqs', label: 'FAQs', icon: 'fas fa-question-circle', path: '/faqs' },
    { id: 'assets', label: 'Assets', icon: 'fas fa-folder-open', path: '/assets-management' },
    // { id: 'configuration', label: 'Configuration', icon: 'fas fa-sliders-h', path: '/configuration' },
    { id: 'amazon-marketplace', label: 'Amazon Marketplace', icon: 'fas fa-store', path: '/amazon-marketplace' },
    {
        id: 'surveys',
        label: 'Survey Module',
        icon: 'fas fa-poll',
        path: '',
        subItems: [
            { id: 'survey-questions', label: 'Survey Questions', path: '/survey-questions' },
            { id: 'survey-responses', label: 'Survey Responses', path: '/survey-responses' }
        ]
    },
    {
        id: 'sku-management',
        label: 'SKU Master',
        icon: 'fas fa-boxes',
        path: '',
        subItems: [
            { id: 'sku-management', label: 'Categories', path: '/categories' },
            // { id: 'shock-replacement-skus', label: 'Shock Replacement SKUs', path: '/shock-replacement-skus' }
        ]
    },
    { id: 'delete-account', label: 'Delete Account', icon: 'fas fa-user-times', path: '/admin-delete-account' },
    { id: 'price-list', label: 'Price List', icon: 'fas fa-file-pdf', path: '/price-list' },
    { id: 'service-config', label: 'Service Config', icon: 'fas fa-sliders-h', path: '/service-config' },
];


export const Layout: React.FC<LayoutProps> = ({
    children,
    sidebarProps,
    topBarProps,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector((state) => state.user.userData);
    const [expanded, setExpanded] = useState(() => {
        const savedExpanded = sessionStorage.getItem('sidebarExpanded');
        return savedExpanded !== null ? JSON.parse(savedExpanded) : false;
    });
    const [isMobile, setIsMobile] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
    const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

    const roleMap: Record<string, string> = {
        "1": "mechanic",
        "2": "regional_manager",
        "3": "call_centre_executive",
        "4": "marketing_manager",
        "5": "operator",
        "6": "viewer",
        "7": "qr_admin",
        "8": "evolve_admin",
        "9": "client_admin"
    };

    const formatRoleLabel = (raw: string) =>
        raw
            .split(/[_\s]+/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");

    const roleIdKey =
        user?.userRoleId !== undefined && user?.userRoleId !== null && String(user.userRoleId) !== ""
            ? String(user.userRoleId)
            : "";

    const roleLabel = user
        ? (user.userRole ||
            (user as any).roleName ||
            (roleIdKey ? roleMap[roleIdKey] : "") ||
            user.userSubRole ||
            (user as any).subRoleName ||
            "")
        : "";

    const displayRole = roleLabel ? formatRoleLabel(roleLabel) : "";

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 992);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setExpanded(false);
        }
    }, [isMobile]);

    useEffect(() => {
        sessionStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
    }, [expanded]);

    // Filter navigation items based on user role
    useEffect(() => {
        const userRoleId = user?.userRoleId;
        const allowedModules = getAllowedModules(userRoleId);

        const filtered = navItems.filter(item => {
            // Check if item's module is allowed
            if (allowedModules.includes(item.id)) {
                return true;
            }
            // For items with subItems, check if any subItems are in allowed modules
            if (item.subItems && item.subItems.length > 0) {
                const hasAllowedSubItem = item.subItems.some(subItem => allowedModules.includes(subItem.id));
                return hasAllowedSubItem;
            }
            return false;
        }).map(item => {
            // Filter subItems if they exist
            if (item.subItems && item.subItems.length > 0) {
                return {
                    ...item,
                    subItems: item.subItems.filter(subItem => allowedModules.includes(subItem.id))
                };
            }
            return item;
        });

        setFilteredNavItems(filtered);
    }, [user?.userRoleId]);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            setExpanded(false);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-[#f4f6fa]">
            {/* Overlay for mobile */}
            {isMobile && expanded && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setExpanded(false)}
                    aria-label="Close sidebar overlay"
                />
            )}

            {/* Mobile Hamburger Button */}
            {isMobile && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="fixed top-4 left-4 z-50 bg-[#001476] text-white p-3 rounded-lg shadow-lg hover:bg-blue-900 transition-all"
                    aria-label="Open sidebar"
                    title="Open sidebar"
                >
                    <i className="fas fa-bars text-xl"></i>
                </button>
            )}

            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div
                    className={`
                        fixed top-0 h-screen bg-[#001476] text-white shadow-xl z-50 transition-all duration-300 ease-in-out flex flex-col
                        ${isMobile
                            ? expanded
                                ? 'left-0 w-4/5 max-w-xs'
                                : '-left-full w-0'
                            : expanded
                                ? 'left-0 w-64'
                                : 'left-0 w-16'
                        }
                    `}
                >
                    {/* Logo Section */}
                    <div className="p-5 border-b border-blue-900/50 flex items-center justify-between flex-shrink-0">
                        {expanded && (
                            <img
                                src="https://ik.imagekit.io/ewxcertfq/ZF_proPoints_Logo_xcept_Black_RGB%201.png?updatedAt=1760210363486"
                                alt="ZF Logo"
                                className="h-10"
                            />
                        )}

                        {/* Desktop Collapse Button */}
                        {!isMobile && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-blue-200 hover:text-white transition-colors ml-auto p-1"
                                aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                                title={expanded ? "Collapse sidebar" : "Expand sidebar"}
                            >
                                <i className={`fas ${expanded ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                            </button>
                        )}

                        {/* Mobile Close Button */}
                        {isMobile && (
                            <button
                                onClick={() => setExpanded(false)}
                                className="text-blue-200 hover:text-white transition-colors ml-auto p-1"
                                aria-label="Close sidebar"
                                title="Close sidebar"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="px-2.5 space-y-1.5">
                            {filteredNavItems.map((item) => {
                                const itemIsActive = isActive(item.path) || (item.subItems && item.subItems.some(sub => isActive(sub.path)));

                                return (
                                    <div key={item.id}>
                                        <button
                                            onClick={() => {
                                                if (item.subItems) {
                                                    setOpenSubMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                                    if (!expanded && !isMobile) setExpanded(true);
                                                } else {
                                                    handleNavigation(item.path);
                                                }
                                            }}
                                            aria-label={item.label}
                                            title={item.label}
                                            className={`
                                                flex items-center w-full text-left transition-all duration-200
                                                ${expanded ? 'px-3.5 py-2.5 rounded-xl' : 'px-3 py-2.5 justify-center rounded-xl'}
                                                ${itemIsActive
                                                    ? 'bg-[#132899] text-white font-semibold shadow-sm border-l-4 border-amber-400'
                                                    : 'text-blue-100/75 hover:bg-blue-900/40 hover:text-white hover:translate-x-1'
                                                }
                                            `}
                                        >
                                            <i className={`${item.icon} ${expanded ? 'mr-3' : ''} text-lg ${itemIsActive ? 'text-white' : 'text-blue-200/90'}`}></i>
                                            {expanded && <span className="text-sm whitespace-nowrap flex-1">{item.label}</span>}
                                            {expanded && item.subItems && (
                                                <i className={`fas fa-chevron-${openSubMenus[item.id] ? 'up' : 'down'} text-xs ml-2 opacity-70`}></i>
                                            )}
                                        </button>

                                        {item.subItems && expanded && openSubMenus[item.id] && (
                                            <div className="pl-9 pr-2 mt-1 space-y-1">
                                                {item.subItems.map((sub: any) => {
                                                    const subIsActive = isActive(sub.path);
                                                    return (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => handleNavigation(sub.path)}
                                                            className={`
                                                                w-full text-left px-3.5 py-2 text-xs rounded-lg transition-colors
                                                                ${subIsActive
                                                                    ? 'text-white font-semibold bg-[#132899]/80 border-l-2 border-amber-400'
                                                                    : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                                                                }
                                                            `}
                                                        >
                                                            {sub.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Profile */}
                    {expanded && (
                        <div className="p-4 border-t border-blue-900/50 flex-shrink-0 bg-[#001063]">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-9 w-9 rounded-full bg-blue-800/80 border border-blue-600/50 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {(displayRole || "-").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3 overflow-hidden">
                                    <p className="text-xs font-semibold text-white truncate">
                                        {displayRole || "-"}
                                    </p>
                                    <p className="text-[11px] text-blue-200/70 truncate">
                                        {user?.userEmail || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div
                    className={`
                        flex-1 transition-all duration-300 ease-in-out
                        ${isMobile
                            ? 'ml-0'
                            : expanded
                                ? 'ml-64'
                                : 'ml-16'
                        }
                    `}
                >
                    <div className="w-full min-h-screen bg-[#f4f6fa]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
