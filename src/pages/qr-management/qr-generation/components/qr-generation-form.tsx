// // src/components/GenerateQRCodes/GenerateQRCodes.tsx

// import React, { FC } from "react";

// interface GenerateQRCodesProps {
//   categories: string[];          // Category names
//   subCategories: string[];       // Subcategory names based on selected category
//   skuList: string[];             // SKU names based on selected subcategory

//   onCategoryChange: (categoryName: string) => void;
//   onSubCategoryChange: (subCategoryName: string) => void;
//   onSubmit: (data: any) => void;
// }

// const GenerateQRCodes: FC<GenerateQRCodesProps> = ({
//   categories,
//   subCategories,
//   skuList,

//   onCategoryChange,
//   onSubCategoryChange,
//   onSubmit,
// }) => {

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const form = e.target as HTMLFormElement;

//     const data = {
//       category: (form.elements.namedItem("category") as HTMLSelectElement).value,
//       subCategory: (form.elements.namedItem("subCategory") as HTMLSelectElement).value,
//       sku: (form.elements.namedItem("sku") as HTMLSelectElement).value,
//       numberOfQrs: (form.elements.namedItem("numberOfQrs") as HTMLInputElement).value,
//     };

//     onSubmit(data);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="w-full p-6 bg-white rounded-2xl shadow-sm border"
//     >
//       <h2 className="text-xl font-semibold mb-6">Generate QR Codes</h2>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//         {/* Category Dropdown */}
//         <div className="flex flex-col">
//           <label className="text-sm font-medium mb-1">Category</label>
//           <select
//             name="category"
//             className="border rounded-lg p-2"
//             required
//             onChange={(e) => onCategoryChange(e.target.value)}
//           >
//             <option value="">-- Select Category --</option>
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Subcategory Dropdown */}
//         <div className="flex flex-col">
//           <label className="text-sm font-medium mb-1">Subcategory</label>
//           <select
//             name="subCategory"
//             className="border rounded-lg p-2"
//             required
//             disabled={subCategories.length === 0}
//             onChange={(e) => onSubCategoryChange(e.target.value)}
//           >
//             <option value="">
//               {subCategories.length === 0
//                 ? "Select Category First"
//                 : "-- Select Subcategory --"}
//             </option>

//             {subCategories.map((sub) => (
//               <option key={sub} value={sub}>
//                 {sub}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* SKU Dropdown */}
//         <div className="flex flex-col">
//           <label className="text-sm font-medium mb-1">SKU</label>
//           <select
//             name="sku"
//             className="border rounded-lg p-2"
//             required
//             disabled={skuList.length === 0}
//           >
//             <option value="">
//               {skuList.length === 0
//                 ? "Select Subcategory First"
//                 : "-- Select SKU --"}
//             </option>

//             {skuList.map((sku) => (
//               <option key={sku} value={sku}>
//                 {sku}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Number of QRs */}
//         <div className="flex flex-col">
//           <label className="text-sm font-medium mb-1">Number of QRs</label>
//           <input
//             name="numberOfQrs"
//             type="number"
//             className="border rounded-lg p-2"
//             placeholder="100"
//             required
//           />
//         </div>

//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end gap-4 mt-8">
//         <button
//           type="button"
//           className="px-4 py-2 rounded-lg border border-gray-300"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//         >
//           Generate QR Codes
//         </button>
//       </div>
//     </form>
//   );
// };

// export default GenerateQRCodes;

import React, { FC, useRef } from "react";

interface SkuOption {
  skuName: string;
  skuCode: string;
}

interface GenerateQRCodesProps {
  categories: string[];          // Category names
  subCategories: string[];       // Subcategory names based on selected category
  skuList: SkuOption[];          // SKU objects with name and code
  isSubCategoriesLoading?: boolean;
  isSkusLoading?: boolean;
  hasSelectedCategory?: boolean;
  hasSelectedSubCategory?: boolean;

  onCategoryChange: (categoryName: string) => void;
  onSubCategoryChange: (subCategoryName: string) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;          // <-- NEW
}

const GenerateQRCodes: FC<GenerateQRCodesProps> = ({
  categories,
  subCategories,
  skuList,
  isSubCategoriesLoading = false,
  isSkusLoading = false,
  hasSelectedCategory = false,
  hasSelectedSubCategory = false,

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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full p-6 bg-white rounded-2xl shadow-sm border"
    >
      <h2 className="text-xl font-semibold mb-6">Generate QR Codes</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Category Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            className="border rounded-lg p-2"
            required
            onChange={(e) => onCategoryChange(e.target.value)}
            defaultValue=""
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Subcategory</label>
          <select
            name="subCategory"
            className="border rounded-lg p-2"
            required
            disabled={subCategories.length === 0 || isSubCategoriesLoading}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            defaultValue=""
          >
            <option value="">
              {isSubCategoriesLoading
                ? "Loading..."
                : subCategories.length === 0
                  ? (hasSelectedCategory ? "No Options Available" : "Select Category First")
                  : "-- Select Subcategory --"}
            </option>

            {subCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* SKU Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">SKU</label>
          <select
            name="sku"
            className="border rounded-lg p-2"
            required
            disabled={skuList.length === 0 || isSkusLoading}
            defaultValue=""
          >
            <option value="">
              {isSkusLoading
                ? "Loading..."
                : skuList.length === 0
                  ? (hasSelectedSubCategory ? "No Options Available" : "Select Subcategory First")
                  : "-- Select SKU --"}
            </option>

            {skuList.map((sku) => (
              <option key={sku.skuCode} value={sku.skuName}>
                {sku.skuName} ({sku.skuCode})
              </option>
            ))}
          </select>
        </div>

        {/* Number of QRs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Number of QRs</label>
          <input
            name="numberOfQrs"
            type="number"
            className="border rounded-lg p-2"
            placeholder="100"
            required
            defaultValue=""
          />
        </div>

      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-gray-300"
          onClick={handleLocalCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Generate QR Codes
        </button>
      </div>
    </form>
  );
};

export default GenerateQRCodes;
