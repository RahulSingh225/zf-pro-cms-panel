import React, { useState } from "react";
import TopBar from "../../layouts/top-bar";
import Reports from "./reports/Reports";
import MISDashboardView from "./MISDashboardView";
import { logoutUser } from "../../redux/slices/userDataSlice";
import { clearTokens } from "../../redux/slices/authTokenSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../services/ApiService";

const MisAnalytics = () => {
    const [activeTab, setActiveTab] = useState("Reports");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await userLogout();
        } catch (err) {
            console.error("Logout API failed:", err);
        }
        dispatch(logoutUser());
        dispatch(clearTokens());
        navigate("/");
    };

    const tabs = [
        { id: "Reports", label: "Detailed Reports" },
    ];

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 pb-10">
            <div className="bg-white">
                <TopBar
                    title="MIS Reports & Analytics"
                    description="Points metrics and detailed system reports"
                    logout={logout}
                />
            </div>

            {/* TABS */}
            <div className="flex gap-8 border border-gray-200 rounded-xl px-6 py-3 ml-6 mr-6 mt-7 bg-white">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            pb-2 text-md font-semibold tracking-wide transition-all 
                            ${activeTab === tab.id
                                ? "text-blue-600 border-b-4 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT SECTION */}
            <div className="mt-6 px-8">
                {activeTab === "Reports" && <Reports />}
            </div>
        </div>
    );
};

export default MisAnalytics;