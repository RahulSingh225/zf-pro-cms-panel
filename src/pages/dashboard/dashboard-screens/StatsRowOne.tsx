import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../dashboard-screens/Card";
import { FaCoins, FaGift, FaUsers, FaUserCheck, FaUserPlus, FaQrcode, FaPercent, FaUserClock, FaWallet } from "react-icons/fa";
import { getMemberCount, getScannedPoints, getRedeemedPoints, getExecutiveStats } from "../../../services/ApiService";
import { GlobalFilterValues } from "./GlobalFilters";

interface StatsRowOneProps {
    filters?: GlobalFilterValues;
}

const StatsRowOne: React.FC<StatsRowOneProps> = ({ filters }) => {
    const navigate = useNavigate();

    // Original stats
    const [totalMembers, setTotalMembers] = useState("0");
    const [activeMembers, setActiveMembers] = useState("0");
    const [scannedPoints, setScannedPoints] = useState({
        totalPoints: 0,
        totalPointsScanned: 0,
        totalBonusPoints: 0
    });
    const [redeemedPoints, setRedeemedPoints] = useState("0");

    // New executive stats from API
    const [execStats, setExecStats] = useState({
        monthlyRegisteredUsers: 0,
        registrationsGrowth: 0,
        registrationsGrowthLabel: "vs last month",
        pointsGrowth: 0,
        pointsGrowthLabel: "vs last month",
        totalBonusPoints: 0,
        totalPointsScanned: 0,
        monthlyScans: 0,
        monthlyActiveUsers: 0,
        outstandingLiability: 0,
        redemptionRate: 0
    });
    const [execLoading, setExecLoading] = useState(true);

    useEffect(() => {
        fetchTotalMembers();
        fetchActiveMembers();
        fetchScannedPoints();
        fetchRedeemedPoints();
        fetchExecutiveStats();
    }, []);

    const fetchTotalMembers = async () => {
        try {
            const response = await getMemberCount({ role: 1 });
            setTotalMembers(response?.data?.count?.toString() || "0");
        } catch (error) {
            console.error("Total members error:", error);
        }
    };

    const fetchActiveMembers = async () => {
        try {
            const [activeRes, tdsRes] = await Promise.all([
                getMemberCount({ role: 1, status: "active_members" }),
                getMemberCount({ role: 1, status: "tds-consent" })
            ]);
            const activeCount = parseInt(activeRes?.data?.count) || 0;
            const tdsCount = parseInt(tdsRes?.data?.count) || 0;
            setActiveMembers((activeCount + tdsCount).toString());
        } catch (error) {
            console.error("Active members error:", error);
        }
    };

    const fetchScannedPoints = async () => {
        try {
            const response = await getScannedPoints({});
            const data = response?.data?.data;
            setScannedPoints({
                totalPoints: data?.totalPoints ?? 0,
                totalPointsScanned: data?.totalPointsScanned ?? 0,
                totalBonusPoints: data?.totalBonusPoints ?? 0
            });
        } catch (error) {
            console.error("Scanned points error:", error);
        }
    };

    const fetchRedeemedPoints = async () => {
        try {
            const response = await getRedeemedPoints({});
            setRedeemedPoints(response?.data?.data?.totalPointsRedeemed?.toString() || "0");
        } catch (error) {
            console.error("Redeemed points error:", error);
        }
    };

    const fetchExecutiveStats = async (dateFilter?: string) => {
        try {
            setExecLoading(true);
            const params: any = {};
            if (dateFilter && dateFilter !== "all") {
                params.range = dateFilter;
            }
            const response = await getExecutiveStats(params);
            const data = response?.data?.data || {};
            setExecStats({
                monthlyRegisteredUsers: data.monthlyRegisteredUsers ?? 0,
                registrationsGrowth: data.registrationsGrowth ?? 0,
                registrationsGrowthLabel: data.registrationsGrowthLabel ?? "vs last month",
                pointsGrowth: data.pointsGrowth ?? 0,
                pointsGrowthLabel: data.pointsGrowthLabel ?? "vs last month",
                totalBonusPoints: data.totalBonusPoints ?? 0,
                totalPointsScanned: data.totalPointsScanned ?? 0,
                monthlyScans: data.monthlyScans ?? 0,
                monthlyActiveUsers: data.monthlyActiveUsers ?? 0,
                outstandingLiability: data.outstandingLiability ?? 0,
                redemptionRate: data.redemptionRate ?? 0
            });
            if (data.totalPointsScanned !== undefined || data.totalBonusPoints !== undefined) {
                setScannedPoints(prev => ({
                    ...prev,
                    totalPointsScanned: data.totalPointsScanned ?? prev.totalPointsScanned,
                    totalBonusPoints: data.totalBonusPoints ?? prev.totalBonusPoints
                }));
            }
        } catch (error) {
            console.error("Executive stats error:", error);
        } finally {
            setExecLoading(false);
        }
    };

    const pointsGrowthText = execStats.pointsGrowth > 0
        ? `+${execStats.pointsGrowth}% ${execStats.pointsGrowthLabel}`
        : execStats.pointsGrowth < 0
            ? `${execStats.pointsGrowth}% ${execStats.pointsGrowthLabel}`
            : `0.0% ${execStats.pointsGrowthLabel}`;
    const pointsGrowthColor = execStats.pointsGrowth >= 0 ? "text-green-600" : "text-red-600";

    const regGrowthText = execStats.registrationsGrowth > 0
        ? `+${execStats.registrationsGrowth}% ${execStats.registrationsGrowthLabel}`
        : execStats.registrationsGrowth < 0
            ? `${execStats.registrationsGrowth}% ${execStats.registrationsGrowthLabel}`
            : `0.0% ${execStats.registrationsGrowthLabel}`;
    const regGrowthColor = execStats.registrationsGrowth >= 0 ? "text-green-600" : "text-red-600";

    return (
        <div className="space-y-6 mb-6">
            {/* ROW 1: Original Program Overview Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CARD 1: Registered Mechanics / Total Members */}
                <Card
                    title="Registered Mechanics / Workshops"
                    value={totalMembers}
                    percentage="+12.5%"
                    percentageColor="text-green-600"
                    icon={<FaUsers />}
                    iconColor='text-blue-500'
                    onClick={() => navigate("/reports?report=registered-users")}
                />

                {/* CARD 2: Active Members */}
                <Card
                    title="Active Members"
                    value={activeMembers}
                    percentage="+4.2%"
                    percentageColor="text-green-600"
                    icon={<FaUserCheck />}
                    iconColor='text-green-500'
                    onClick={() => navigate("/reports?report=registered-users&status=active_members")}
                />

                {/* CARD 3: Total Points Issued */}
                <Card
                    title="Total Points Issued"
                    value={scannedPoints.totalPointsScanned.toLocaleString()}
                    percentage={pointsGrowthText}
                    percentageColor={pointsGrowthColor}
                    icon={<FaCoins />}
                    iconColor='text-yellow-500'
                    onClick={() => navigate("/reports?report=qr")}
                    extra={
                        <div className="flex gap-4 text-xs font-medium border-t border-gray-100 pt-2 mt-1 w-full justify-between">
                            <div>
                                <span className="text-gray-400">Scanned: </span>
                                <span className="text-gray-700 font-semibold">{scannedPoints.totalPointsScanned.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Bonus: </span>
                                <span className="text-gray-700 font-semibold">{scannedPoints.totalBonusPoints.toLocaleString()}</span>
                            </div>
                        </div>
                    }
                />

                {/* CARD 4: Points Redeemed */}
                <Card
                    title="Points Redeemed"
                    value={redeemedPoints}
                    percentage="-3.4%"
                    percentageColor="text-red-600"
                    icon={<FaGift />}
                    iconColor='text-purple-500'
                    onClick={() => navigate("/reports?report=redemptions")}
                />
            </div>

            {/* ROW 2: Executive Monthly & Financial Performance Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* CARD 5: Monthly Active Users */}
                <Card
                    title="Monthly Active Users"
                    value={execLoading ? "..." : execStats.monthlyActiveUsers.toLocaleString()}
                    percentage="MAU (This Month)"
                    percentageColor="text-indigo-600"
                    icon={<FaUserClock />}
                    iconColor='text-indigo-500'
                    onClick={() => navigate("/reports?report=registered-users")}
                />

                {/* CARD 6: Monthly Registrations */}
                <Card
                    title="Monthly Registrations"
                    value={execLoading ? "..." : execStats.monthlyRegisteredUsers.toLocaleString()}
                    percentage={regGrowthText}
                    percentageColor={regGrowthColor}
                    icon={<FaUserPlus />}
                    iconColor='text-blue-500'
                    onClick={() => navigate("/reports?report=registered-users")}
                />

                {/* CARD 7: Monthly Scans */}
                <Card
                    title="Monthly Scans"
                    value={execLoading ? "..." : execStats.monthlyScans.toLocaleString()}
                    percentage="This Month"
                    percentageColor="text-teal-600"
                    icon={<FaQrcode />}
                    iconColor='text-teal-500'
                    onClick={() => navigate("/reports?report=qr")}
                />

                {/* CARD 8: Outstanding Liability */}
                <Card
                    title="Outstanding Liability"
                    value={execLoading ? "..." : execStats.outstandingLiability.toLocaleString()}
                    percentage="Points to Redeem"
                    percentageColor="text-amber-600"
                    icon={<FaWallet />}
                    iconColor='text-amber-500'
                    onClick={() => navigate("/reports?report=application-login")}
                />

                {/* CARD 9: Welcome Bonus Points Issued */}
                <Card
                    title="Welcome Bonus Points Issued"
                    value={execLoading ? "..." : (scannedPoints.totalBonusPoints || execStats.totalBonusPoints || 0).toLocaleString()}
                    percentage="Bonus Points"
                    percentageColor="text-purple-600"
                    icon={<FaGift />}
                    iconColor='text-purple-500'
                    onClick={() => navigate("/reports?report=application-login")}
                />
            </div>
        </div>
    );
};

export default StatsRowOne;
