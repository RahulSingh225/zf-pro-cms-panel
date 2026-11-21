import React, { useState } from "react";
import AccessLogsScreen from "../role-management/access-logs/AccessLogsPage";
import TopBar from "../../layouts/top-bar";
import QrGeneration from "./qr-generation/qr-generation";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/userDataSlice";
import { clearTokens } from "../../redux/slices/authTokenSlice";
import { userLogout } from "../../services/ApiService";

const Qr = () => {
    const [activeTab, setActiveTab] = useState("qr-generation");
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
        { id: "qr-generation", label: "QR Generation" },
        // { id: "audit-logs", label: "Audit Logs" },
    ];

    return (
        <div className="h-screen overflow-y-auto bg-gray-100 pb-10">
            <div className="bg-white">
                <TopBar
                    title="QR Management"
                    description="Generate and manage QR codes for products"
                    logout={logout}
                />
            </div>

            {/* TABS SECTION */}
            <div>
                <div
                    className="
                        flex gap-12 
                        border border-gray-200 
                        rounded-xl 
                        px-6 py-4 
                        ml-6 
                        mr-6
                        mt-7
                        bg-white
                    "
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                pb-4 
                                text-lg font-semibold 
                                tracking-wide
                                transition-all 
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
            </div>

            {/* CONTENT SECTION */}
            <div className="mt-7 px-6">
                {activeTab === "qr-generation" && <QrGeneration />}
                {/* {activeTab === "audit-logs" && <AccessLogsScreen />} */}
            </div>
        </div>
    );
};

export default Qr;