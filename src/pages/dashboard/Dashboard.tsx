import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../layouts/top-bar";
import GlobalFilters, { GlobalFilterValues } from "./dashboard-screens/GlobalFilters";
import ExecutiveTab from "./dashboard-screens/views/ExecutiveTab";
import TabErrorBoundary from "./dashboard-screens/views/TabErrorBoundary";
import {
    ProgramPerformanceTab,
    SalesBusinessTab,
    Member360Tab,
    ProductSKUTab,
    RewardsTab,
    GeographyTab,
} from "./dashboard-screens/views/PlaceholderTabs";
import { useDispatch } from "react-redux";
import { clearTokens } from "../../redux/slices/authTokenSlice";
import { logoutUser } from "../../redux/slices/userDataSlice";
import { userLogout } from "../../services/ApiService";

// ─── Tab definitions ───────────────────────────────────────────────────────
type TabId =
    | "executive"
    | "program-performance"
    | "sales-business"
    | "member-360"
    | "product-sku"
    | "rewards"
    | "geography";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "executive", label: "Executive" },
    { id: "program-performance", label: "Program Performance" },
    { id: "sales-business", label: "Scans" },
    { id: "member-360", label: "Member 360" },
    { id: "product-sku", label: "Product & SKU" },
    { id: "rewards", label: "Rewards" },
    { id: "geography", label: "Geography" },
];

// ─── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState<TabId>("executive");
    const [filters, setFilters] = useState<GlobalFilterValues>({
        region: "all",
        product: "all",
        category: "all",
        date: "all",
    });

    useEffect(() => {
        console.log("📊 Dashboard component mounted");
    }, []);

    const logout = async () => {
        try {
            console.log("🔐 Logging out user...");
            await userLogout();
        } catch (err) {
            console.error("❌ Logout API failed:", err);
        }
        dispatch(logoutUser());
        dispatch(clearTokens());
        console.log("✅ User logged out successfully");
        navigate("/");
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "executive":
                return <ExecutiveTab filters={filters} />;
            case "program-performance":
                return <ProgramPerformanceTab filters={filters} />;
            case "sales-business":
                return <SalesBusinessTab filters={filters} />;
            case "member-360":
                return <Member360Tab filters={filters} />;
            case "product-sku":
                return <ProductSKUTab filters={filters} />;
            case "rewards":
                return <RewardsTab filters={filters} />;
            case "geography":
                return <GeographyTab filters={filters} />;
            default:
                return <ExecutiveTab filters={filters} />;
        }
    };

    return (
        <div className="h-screen overflow-y-auto pb-10">
            <TopBar logout={logout} />

            <div className="mx-5 mt-4">
                {/* ── Section title ── */}
                <h1 className="text-xl font-bold text-gray-800 mb-3">Analytics Dashboards</h1>

                {/* ── Global Filters ── */}
                {/* <GlobalFilters filters={filters} onChange={setFilters} /> � commented out, each chart has its own filter */}

                {/* ── Tabs ── */}
                <div className="flex items-center gap-1.5 mb-5 overflow-x-auto bg-gray-100 rounded-xl p-1 w-fit max-w-full">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200
                                    focus:outline-none
                                    ${isActive
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Tab Content ── */}
                <TabErrorBoundary key={activeTab} tabName={activeTab}>
                    {renderTabContent()}
                </TabErrorBoundary>
            </div>
        </div>
    );
};

export default Dashboard;