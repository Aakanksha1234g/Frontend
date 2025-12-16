// import React, { Suspense, lazy } from "react";
// import download from "@assets/icons/DownloadMinimalistic.svg";

// // 🛠 Use React.lazy instead of next/dynamic
// const PDFDownloadLink = lazy(() => import("@react-pdf/renderer").then((mod) => ({ default: mod.PDFDownloadLink })));

// const PDFDownloadButton = ({ data, filename }) => {
//   return (
//     <Suspense fallback={<span>Loading...</span>}>
//       <PDFDownloadLink document={data()} fileName={filename}>
//         {({ loading, url }) => (
//           <a href={url || "#"} download={filename} className="flex items-center iconButton">
//             <img src={download} alt="Download icon" className="w-5 h-5 object-contain" />
//           </a>
//         )}
//       </PDFDownloadLink>
//     </Suspense>
//   );
// };

// export default PDFDownloadButton;
