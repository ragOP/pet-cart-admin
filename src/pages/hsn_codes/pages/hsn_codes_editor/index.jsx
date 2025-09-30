// import NavbarItem from "@/components/navbar/navbar_items";
// import { useParams } from "react-router";
// import { useQuery } from "@tanstack/react-query";
// import { CustomSpinner } from "@/components/loaders/CustomSpinner";
// import { getHsnCodeById } from "./helper/getHsnCodeById";
// import HsnCodeForm from "./components/HsnCodeForm";

// const HsnCodesEditor = () => {
//   const { id } = useParams();

//   const { data: initialDataRes = {}, isLoading } = useQuery({
//     queryKey: ["hsn_codes", id],
//     queryFn: () => getHsnCodeById({ id }),
//     enabled: !!id,
//   });

//   const initialData = initialDataRes?.response?.data;

//   const breadcrumbs = [
//     { title: "HSN Codes", isNavigation: true, path: "/dashboard/hsn_codes" },
//     { title: id ? "Edit HSN Code" : "Add HSN Code", isNavigation: false },
//   ];

//   return (
//     <div className="flex flex-col">
//       <NavbarItem
//         title={id ? "Edit HSN Code" : "Add HSN Code"}
//         breadcrumbs={breadcrumbs}
//       />
//       <div className="px-8 py-4">
//         {isLoading ? (
//           <div className="flex flex-1 justify-center items-center">
//             <CustomSpinner />
//           </div>
//         ) : (
//           <HsnCodeForm initialData={initialData} isEdit={!!id} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default HsnCodesEditor;
