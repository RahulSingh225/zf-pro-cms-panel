import React, { useState } from "react";
import { toast } from "react-toastify";
import { deleteAccountPreview, deleteUserAccount } from "../../services/ApiService";

const CONFIRMATION_PHRASE = "DELETE";

type Step = "input" | "preview" | "confirm";

interface UserPreview {
    userId: number;
    userName: string;
    userCode: string | null;
    userMobile: string;
    userRoleId: number;
    roleName: string | null;
    blockStatus: string;
    createdAt: string | null;
    workshopName: string | null;
    tier: string | null;
    earnedPoints: string | null;
    balancePoints: string | null;
    redeemedPoints: string | null;
    kycApproval: boolean | null;
    currentAddress: string | null;
    currentCity: string;
    currentDistrict: string;
    currentState: string;
    currentPincode: number | null;
    zoneName: string | null;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500 flex-shrink-0 w-32">{label}</span>
        <span className={`text-xs font-medium text-right ${highlight ? "text-red-600 font-bold" : "text-slate-800"}`}>
            {value ?? <span className="text-slate-400 italic">N/A</span>}
        </span>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, string> = {
        none: "bg-green-100 text-green-700",
        inactive: "bg-slate-100 text-slate-600",
        "de-activated": "bg-red-100 text-red-700",
        login: "bg-yellow-100 text-yellow-700",
        kyc: "bg-orange-100 text-orange-700",
        dormant: "bg-purple-100 text-purple-700",
    };
    const cls = colorMap[status] ?? "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
            {status}
        </span>
    );
};

const AdminDeleteAccountPage: React.FC = () => {
    const [step, setStep] = useState<Step>("input");
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [preview, setPreview] = useState<UserPreview | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const validateMobile = (value: string) => {
        if (!value.trim()) return "Mobile number is required";
        if (!/^\d{10}$/.test(value.trim())) return "Enter a valid 10-digit mobile number";
        return "";
    };

    const handleFetchPreview = async () => {
        const error = validateMobile(mobile);
        if (error) { setMobileError(error); return; }
        setMobileError("");
        setFetchError(null);
        setPreview(null);
        setIsLoading(true);
        try {
            const res = await deleteAccountPreview(mobile.trim());
            // API shape: { code, message, data: UserPreview }
            const data = (res?.data?.data ?? res?.data) as UserPreview;
            if (!data || !data.userId) {
                setFetchError("Only Mechanic accounts can be deleted.");
                return;
            }
            setPreview(data);
            setConfirmText("");
            setStep("preview");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.responseMessage ||
                "Failed to fetch user details. Please try again.";
            setFetchError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirmText !== CONFIRMATION_PHRASE || isDeleting) return;
        setIsDeleting(true);
        try {
            const res = await deleteUserAccount(mobile.trim());
            const data = res?.data;
            toast.success(data?.message || `Account for ${mobile} deleted successfully`);
            setMobile(""); setConfirmText(""); setPreview(null); setStep("input"); setFetchError(null);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.responseMessage ||
                "Failed to delete account. Please try again.";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReset = () => {
        setStep("input"); setConfirmText(""); setPreview(null); setMobileError(""); setFetchError(null);
    };

    const blockPaste = (e: React.ClipboardEvent | React.DragEvent) => e.preventDefault();

    const STEPS: Step[] = ["input", "preview", "confirm"];
    const stepLabels: Record<Step, string> = {
        input: "Enter Mobile",
        preview: "Verify Details",
        confirm: "Confirm Delete",
    };
    const currentIdx = STEPS.indexOf(step);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#f4f6fa]">
            <div className="w-full max-w-lg">

                <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 mb-4">
                        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Delete Account</h1>
                    <p className="text-sm text-slate-500 mt-1">Permanently delete a mechanic account and all associated data.</p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-5">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === s ? "text-red-600" : "text-slate-400"}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200
                                    ${step === s ? "bg-red-600 text-white ring-2 ring-red-200" : currentIdx > i ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                                    {currentIdx > i ? "✓" : i + 1}
                                </div>
                                <span className="hidden sm:inline">{stepLabels[s]}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-px max-w-8 ${currentIdx > i ? "bg-green-400" : "bg-slate-200"}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-700">Irreversible Action</p>
                        <p className="text-xs text-red-600 mt-1 leading-relaxed">
                            Deleting an account permanently removes all transactions, KYC data, bank details, redemptions, notifications, and activity logs. This cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">{stepLabels[step]}</h2>
                            <p className="text-xs text-slate-500">
                                {step === "input" && "Provide the mobile number of the mechanic account to delete"}
                                {step === "preview" && `Verify the details below for ${mobile} before proceeding`}
                                {step === "confirm" && `You are about to permanently delete: ${mobile}`}
                            </p>
                        </div>
                    </div>

                    {/* Step 1: Mobile Input */}
                    {step === "input" && (
                        <div className="px-6 py-6 space-y-4">
                            <div>
                                <label htmlFor="admin-delete-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                                <input
                                    id="admin-delete-mobile"
                                    type="tel"
                                    maxLength={10}
                                    autoFocus
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition-all
                                        ${mobileError ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
                                    placeholder="Enter 10-digit mobile number"
                                    value={mobile}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setMobile(val);
                                        if (mobileError) setMobileError(validateMobile(val));
                                        if (fetchError) setFetchError(null);
                                    }}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleFetchPreview(); }}
                                />
                                {mobileError && (
                                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {mobileError}
                                    </p>
                                )}
                            </div>

                            {fetchError && (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-3.5">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-amber-800">Account Cannot Be Deleted</p>
                                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{fetchError}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                id="btn-admin-delete-fetch-preview"
                                type="button"
                                onClick={handleFetchPreview}
                                disabled={mobile.length !== 10 || isLoading}
                                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Fetching Details...
                                    </>
                                ) : "Fetch Account Details"}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Preview */}
                    {step === "preview" && (
                        <div className="px-6 py-6 space-y-5">
                            {!preview ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Loading user details...</div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Identity</p>
                                        <div className="bg-slate-50 rounded-lg px-4 py-1 border border-slate-100">
                                            <DetailRow label="User Code" value={preview.userCode} />
                                            <DetailRow label="Name" value={preview.userName} />
                                            <DetailRow label="Mobile" value={preview.userMobile} />
                                            <DetailRow label="Role" value={preview.roleName ?? `Role ${preview.userRoleId}`} />
                                            <DetailRow label="Status" value={<StatusBadge status={preview.blockStatus} />} />
                                            <DetailRow label="KYC Approved" value={preview.kycApproval ? "Yes" : "No"} />
                                            <DetailRow label="Joined" value={preview.createdAt ? new Date(preview.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Workshop & Points</p>
                                        <div className="bg-slate-50 rounded-lg px-4 py-1 border border-slate-100">
                                            <DetailRow label="Workshop" value={preview.workshopName} />
                                            <DetailRow label="Tier" value={preview.tier} />
                                            <DetailRow label="Balance Points" value={Number(preview.balancePoints ?? 0).toLocaleString("en-IN")} highlight={Number(preview.balancePoints) > 0} />
                                            <DetailRow label="Earned Points" value={Number(preview.earnedPoints ?? 0).toLocaleString("en-IN")} />
                                            <DetailRow label="Redeemed Points" value={Number(preview.redeemedPoints ?? 0).toLocaleString("en-IN")} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Address & Zone</p>
                                        <div className="bg-slate-50 rounded-lg px-4 py-1 border border-slate-100">
                                            <DetailRow label="Zone" value={preview.zoneName} />
                                            <DetailRow label="City" value={preview.currentCity} />
                                            <DetailRow label="District" value={preview.currentDistrict} />
                                            <DetailRow label="State" value={preview.currentState} />
                                            <DetailRow label="Pincode" value={preview.currentPincode} />
                                            <DetailRow label="Address" value={preview.currentAddress} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={handleReset} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all">← Change Mobile</button>
                                        <button id="btn-admin-delete-proceed-confirm" type="button" onClick={() => setStep("confirm")} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white text-sm font-semibold">Proceed to Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === "confirm" && (
                        <div className="px-6 py-6 space-y-5">
                            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3">
                                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500">Permanently deleting account</p>
                                    <p className="text-sm font-bold text-slate-800">{preview?.userName} &bull; {mobile}</p>
                                    {preview?.userCode && <p className="text-[11px] text-slate-400 font-mono">{preview.userCode}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-delete-confirm-text" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Type{" "}<span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs tracking-widest font-mono">DELETE</span>{" "}to confirm
                                </label>
                                <input
                                    id="admin-delete-confirm-text"
                                    type="text"
                                    autoFocus
                                    autoComplete="off"
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all font-mono tracking-widest
                                        ${confirmText && confirmText !== CONFIRMATION_PHRASE ? "border-orange-300 bg-orange-50 focus:ring-2 focus:ring-orange-200"
                                            : confirmText === CONFIRMATION_PHRASE ? "border-green-400 bg-green-50 focus:ring-2 focus:ring-green-200"
                                                : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
                                    placeholder="DELETE"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleDelete(); }}
                                    onPaste={blockPaste}
                                    onDrop={blockPaste}
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                                {confirmText && confirmText !== CONFIRMATION_PHRASE && (
                                    <p className="text-xs text-orange-600 mt-1.5">Type exactly &ldquo;DELETE&rdquo; to enable the button</p>
                                )}
                                <p className="text-[11px] text-slate-400 mt-1.5">⚠ Copy-paste is disabled — you must type this manually.</p>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setStep("preview"); setConfirmText(""); }} disabled={isDeleting} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50">← Back</button>
                                <button
                                    id="btn-admin-delete-confirm"
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={confirmText !== CONFIRMATION_PHRASE || isDeleting}
                                    className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : "Delete Permanently"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-xs text-slate-400 text-center mt-4">
                    This action is restricted to Evolve Admin only. All deletions are logged.
                </p>
            </div>
        </div>
    );
};

export default AdminDeleteAccountPage;
