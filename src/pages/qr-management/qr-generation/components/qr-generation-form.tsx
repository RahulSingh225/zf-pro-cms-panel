import React, { FC, useRef } from "react";
import { ChevronDown, QrCode } from "lucide-react";

interface GenerateQRCodesProps {
  categories: string[];          // Category names
  subCategories: string[];       // Subcategory names based on selected category
  skuList: string[];             // SKU names based on selected subcategory
  isSubCategoriesLoading?: boolean;
  isSkusLoading?: boolean;
  hasSelectedCategory?: boolean;
  hasSelectedSubCategory?: boolean;
  isSubmitting?: boolean;

  onCategoryChange: (categoryName: string) => void;
  onSubCategoryChange: (subCategoryName: string) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const labelClass = "text-sm font-semibold text-gray-800 mb-1.5";
const fieldClass =
  "w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 " +
  "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

const Required = () => <span className="text-red-500 ml-0.5">*</span>;

const SelectField: FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <div className="relative">
    <select {...props} className={`${fieldClass} appearance-none pr-9`}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
  </div>
);

const GenerateQRCodes: FC<GenerateQRCodesProps> = ({
  categories,
  subCategories,
  skuList,
  isSubCategoriesLoading = false,
  isSkusLoading = false,
  hasSelectedCategory = false,
  hasSelectedSubCategory = false,
  isSubmitting = false,

  onCategoryChange,
  onSubCategoryChange,
  onSubmit,
  onCancel,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const data = {
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      subCategory: (form.elements.namedItem("subCategory") as HTMLSelectElement).value,
      sku: (form.elements.namedItem("sku") as HTMLSelectElement).value,
      numberOfQrs: (form.elements.namedItem("numberOfQrs") as HTMLInputElement).value,
    };

    onSubmit(data);
  };

  const handleLocalCancel = () => {
    // 1) Tell parent to clear its state (options arrays & selected ids)
    onCancel();

    // 2) Reset the form DOM after parent state updates (setTimeout 0 ensures React render runs first)
    setTimeout(() => {
      formRef.current?.reset();
    }, 0);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-[#174A8B] bg-white shadow-sm">
      {/* Header */}
      <div className="bg-[#174A8B] px-5 pt-3">
        <div className="inline-flex items-center gap-2 border-b-[3px] border-yellow-400 pb-3 text-white">
          <QrCode className="h-5 w-5" />
          <span className="text-base font-semibold">QR Generation</span>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-[#F8FAFC] px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Generate QR Codes</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category */}
          <div className="flex flex-col">
            <label className={labelClass}>Category<Required /></label>
            <SelectField
              name="category"
              required
              onChange={(e) => onCategoryChange(e.target.value)}
              defaultValue=""
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Subcategory */}
          <div className="flex flex-col">
            <label className={labelClass}>Subcategory<Required /></label>
            <SelectField
              name="subCategory"
              required
              disabled={subCategories.length === 0 || isSubCategoriesLoading}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              defaultValue=""
            >
              <option value="">
                {isSubCategoriesLoading
                  ? "Loading..."
                  : subCategories.length === 0
                    ? (hasSelectedCategory ? "No Options Available" : "Select Subcategory")
                    : "Select Subcategory"}
              </option>
              {subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </SelectField>
          </div>

          {/* SKU */}
          <div className="flex flex-col">
            <label className={labelClass}>SKU<Required /></label>
            <SelectField
              name="sku"
              required
              disabled={skuList.length === 0 || isSkusLoading}
              defaultValue=""
            >
              <option value="">
                {isSkusLoading
                  ? "Loading..."
                  : skuList.length === 0
                    ? (hasSelectedSubCategory ? "No Options Available" : "Select SKU")
                    : "Select SKU"}
              </option>
              {skuList.map((sku) => (
                <option key={sku} value={sku}>
                  {sku}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Number of QRs */}
          <div className="flex flex-col">
            <label className={labelClass}>Number of QR's<Required /></label>
            <input
              name="numberOfQrs"
              type="number"
              min={1}
              step={1}
              className={fieldClass}
              placeholder="Enter Quantity"
              required
              defaultValue=""
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="h-10 px-5 rounded-lg border border-[#174A8B] bg-white text-sm font-semibold text-[#174A8B] hover:bg-blue-50"
            onClick={handleLocalCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-[#1440B8] text-sm font-semibold text-white hover:bg-[#10349A] disabled:opacity-60"
          >
            <QrCode className="h-4 w-4" />
            Generate QR Codes
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateQRCodes;
