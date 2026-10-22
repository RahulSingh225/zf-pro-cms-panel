import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { getProductWiseReport } from "../../../../services/ApiService";
import { ProductWiseReportKeys } from "../../../../utils/ExportKeyMappings";


const ProductWiseReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [scandate, setScandate] = useState("");
    const [memberName, setMemberName] = useState("");
    const [productCode, setProductCode] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productType, setProductType] = useState("");
    const [userType, setUserType] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [zone, setZone] = useState("");
    const [workshop, setWorkshop] = useState("");

    const [tableData, setTableData] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const formatCell = (value: any) => {
        if (value === null || value === undefined || value === "") return "-";
        return value;
    };

    const columns: Column[] = [
        { key: "userId", label: "User ID" },
        { key: "memberName", label: "Member Name" },
        { key: "workshop", label: "Workshop" },
        { key: "zone", label: "Zone" },
        { key: "city", label: "City" },
        { key: "productCode", label: "Product Code" },
        { key: "productCategory", label: "Product Category" },
        { key: "productType", label: "Product Type" },
        { key: "productDescription", label: "Product Description" },
        { key: "userType", label: "User Type" },
        { key: "district", label: "District" },
        { key: "state", label: "State" },
        {
            key: "scanDate",
            label: "Scan Date",
            format: (value: any) => {
                if (!value || value === '-') return '-';
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "pointsEarned", label: "Points Earned" }
    ];

    const fetchTableData = async (currentPage: number, isExport = false) => {
        try {
            if (!isExport) setLoading(true);
            const payload: any = {
                limit: isExport ? totalRows || 10000 : pageSize,
                skip: isExport ? 0 : (currentPage - 1) * pageSize,
            };

            if (fromDate) payload.fromDate = new Date(fromDate).toISOString();
            if (toDate) {
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999);
                payload.toDate = toDateObj.toISOString();
            }
            if (scandate) payload.scandate = new Date(scandate).toISOString();
            if (memberName) payload.memberName = memberName;
            if (productCode) payload.productCode = productCode;
            if (productCategory) payload.productCategory = productCategory;
            if (productType) payload.productType = productType;
            if (userType) payload.userType = userType;
            if (district) payload.district = district;
            if (state) payload.state = state;
            if (city) payload.city = city;
            if (zone) payload.zone = zone;
            if (workshop) payload.workshop = workshop;

            const response = await getProductWiseReport(payload);

            if (response?.data?.code === 200) {
                if (isExport) {
                    return response?.data?.data?.reportList || [];
                } else {
                    const mapped = (response?.data?.data?.reportList || []).map((item: any) => {
                        const row: any = {};
                        Object.keys(item).forEach(k => { row[k] = formatCell(item[k]); });
                        return row;
                    });
                    setTableData(mapped);
                    setTotalRows(response?.data?.data?.totalCount || 0);
                }
            } else {
                if (!isExport) {
                    setTableData([]);
                    setTotalRows(0);
                }
            }
        } catch (error) {
            console.error("Error fetching product wise report:", error);
            if (!isExport) {
                setTableData([]);
                setTotalRows(0);
            }
        } finally {
            if (!isExport) setLoading(false);
        }
    };

    useEffect(() => {
        const canFetchDate = (!fromDate && !toDate) || (fromDate && toDate);
        if (!canFetchDate) return;

        const textFilters = [memberName, productCode, productCategory, productType, userType, district, state];
        const hasInvalidText = textFilters.some(filter => filter !== undefined && filter.length > 0 && filter.length < 3);

        if (hasInvalidText) return;

        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, fromDate, toDate, scandate, memberName, productCode, productCategory, productType, userType, district, state]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);

        const formatExportDate = (val: any) => {
            if (!val || val === "-") return "-";
            const d = new Date(val);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        const exportData = data.map((item: any) => ({
            userId: formatCell(item.userId),
            memberName: formatCell(item.memberName),
            workshop: formatCell(item.workshop ?? item.workshopName),
            zone: formatCell(item.zone),
            city: formatCell(item.city),
            productCode: formatCell(item.productCode),
            productCategory: formatCell(item.productCategory),
            productType: formatCell(item.productType),
            productDescription: formatCell(item.productDescription),
            userType: formatCell(item.userType),
            district: formatCell(item.district),
            state: formatCell(item.state),
            scanDate: formatExportDate(item.scanDate),
            pointsEarned: formatCell(item.pointsEarned)
        }));

        return exportData;
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Product Wise Report</h2>
                    <p className="text-gray-500 text-sm">Detailed report on product scans</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="Product Wise Report" />
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg items-center gap-4">
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">From Date</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">To Date</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Scan Date</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={scandate}
                            onChange={(e) => setScandate(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Member Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Code</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Category</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Type</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">User Type</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">District</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">State</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <CustomTable
                    data={tableData}
                    columns={columns}
                    pageSize={pageSize}
                    totalRows={totalRows}
                    currentPage={page}
                    onPageChange={onPageChange}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ProductWiseReport;
