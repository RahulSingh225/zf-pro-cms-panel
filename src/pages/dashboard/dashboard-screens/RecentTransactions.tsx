import React, { useEffect, useState } from "react";
import { getRecentTransactions } from "../../../services/ApiService";
import { useNavigate } from "react-router-dom";

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getRecentTransactions(5);
      setTransactions(response?.data?.data || []);
    } catch (error) {
      console.error("Error loading recent transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <button
          className="text-blue-600 text-sm font-medium hover:underline"
          onClick={() => navigate("/mis-analytics", { state: { report: "qr" } })}
        >
          View All
        </button>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-6 text-sm font-semibold text-gray-600 border-b pb-2 gap-2">
        <div>Transaction ID</div>
        <div>Member</div>
        <div>Workshop</div>
        <div>Type</div>
        <div>Points</div>
        <div>Timestamp</div>
      </div>

      {loading ? (
        <p className="py-4 text-gray-500">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="py-4 text-gray-500">No transactions found</p>
      ) : (
        transactions.map((txn: any, index: number) => (
          <div
            key={index}
            className="grid grid-cols-6 py-3 text-sm items-center border-b last:border-none gap-2"
          >
            <div className="text-gray-800">#{txn.id}</div>

            <div className="text-gray-800 truncate">
              {txn.displayName || txn.userEmail}
            </div>

            <div className="text-gray-600 truncate font-medium">
              {txn.workshopName || txn.storeName || "-"}
            </div>

            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  txn.type === "scan"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {txn.type}
              </span>
            </div>

            <div className="font-medium text-green-600">
              +{txn.points}
            </div>

            <div className="text-xs leading-tight">
              <div className="font-medium text-gray-700">
                {new Date(txn.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </div>
              <div className="text-gray-400">
                {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentTransactions;
