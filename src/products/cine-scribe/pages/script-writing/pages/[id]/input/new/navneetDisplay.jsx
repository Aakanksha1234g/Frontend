// import React, { Suspense, useEffect, useReducer, useState } from "react";
// import { useParams } from "react-router";
// import DisplayScriptLayout from "../../layout";
// import { apiRequest } from "@shared/utils/api-client";
// import ScriptEditor from "./ScriptEditor";
// import { Fountain } from "fountain-js";
// import {
//   sceneIntExtOptionList,
//   sceneShotTimeOptionList,
// } from "../../evaluation/constant";
// const fountain = new Fountain();

// const NScriptInput = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { id } = useParams();
//   const [selectedScene, setSelectedScene] = useState(null);

//   const statusList = [
//     {
//       name: "Script Input",
//       activeStatus: true,
//       redirectedPath: `/cine-scribe/script-writing/${id}/input`,
//     },
//     {
//       name: "Act Analysis",
//       activeStatus: data?.script_analysis_data,
//       redirectedPath: `/cine-scribe/script-writing/${id}/analysis`,
//     },
//     {
//       name: "Beat Sheet",
//       activeStatus: data?.script_analysis_data,
//       redirectedPath: `/cine-scribe/script-writing/${id}/beat-sheet`,
//     },
//     {
//       name: "Character Arc",
//       activeStatus: data?.script_analysis_data,
//       redirectedPath: `/cine-scribe/script-writing/${id}/character-arc`,
//     },
//     {
//       name: "Final Report",
//       activeStatus: data?.script_analysis_data,
//       redirectedPath: `/cine-scribe/script-writing/${id}/report`,
//     },
//   ];

//   // useEffect(() => {
//   //   let isSubscribed = true;

//   //   const fetchData = async () => {
//   //     try {
//   //       setLoading(true);
//   //       setError(null);

//   //       const response = await apiRequest({
//   //         endpoint: `/scene_data/display_scene_data/${id}`,
//   //       });

//   //       if (!isSubscribed) return;

//   //       if (!response?.response) {
//   //         throw new Error("Invalid API response format");
//   //       }

//   //       const apiData = response.response;
//   //       setData(apiData);

//   //       dispatch({
//   //         type: "UPDATE_FORM_DATA",
//   //         payload: apiData,
//   //       });
//   //     } catch (error) {
//   //       if (!isSubscribed) return;
//   //     } finally {
//   //       if (!isSubscribed) return;
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchData();

//   //   return () => (isSubscribed = false);
//   // }, [id]);

//   // useEffect(() => {
//   //   const sceneId = new URLSearchParams(window.location.search).get("sceneId");
//   //   if (data?.scene_summaries) {
//   //     let scene;
//   //     if (sceneId) {
//   //       scene = data.scene_summaries.find(
//   //         (s) => s.scene_data_id === Number(sceneId)
//   //       );
//   //     } else {
//   //       scene = data.scene_summaries[0]; // Default to the first scene
//   //     }
//   //     setSelectedScene(scene);
//   //   }
//   // }, [data]);

//   const convertSceneObjectsToScript = (sceneObjects) => {
//     return sceneObjects
//       .map((scene) => {
//         const interiorExterior =
//           sceneIntExtOptionList
//             .find((opt) => opt.id === scene.scene_interior_exterior)
//             ?.value.toUpperCase() || "INT";

//         const shotTime =
//           sceneShotTimeOptionList
//             .find((opt) => opt.id === scene.scene_shot_time)
//             ?.value.toUpperCase() || "DAY";

//         const location =
//           scene.scene_location?.toUpperCase() || "UNKNOWN LOCATION";

//         const sceneHeading = `${interiorExterior}. ${location} - ${shotTime}`;

//         return `${sceneHeading}\n\n${scene.scene_summary?.trim() || ""}`;
//       })
//       .join("\n\n");
//   };
//   const renderFormattedScript = (tokens) => {

//     return tokens.map((token, idx) => {
//       switch (token.type) {
//         case "scene_heading":
//           return (
//             <h3 key={idx} className="uppercase font-bold mt-4">
//               {token.text}
//             </h3>
//           );
//         case "action":
//           return (
//             <p key={idx} className="my-2">
//               {token.text}
//             </p>
//           );
//         case "character":
//           return (
//             <p key={idx} className="uppercase text-center font-semibold mt-4">
//               {token.text}
//             </p>
//           );
//         case "dialogue":
//           return (
//             <p key={idx} className="text-center italic text-gray-500">
//               {token.text}
//             </p>
//           );
//         default:
//           return <p key={idx}>{token.text}</p>;
//       }
//     });
//   };
//   return (
//     <DisplayScriptLayout statusList={statusList}>
//       <div className="flex gap-4 w-full h-full">
//         {/* <div className="py-2 w-fit p-0 m-0 shadow-sm shadow-shadow-chat-button rounded-lg items-start flex flex-col gap-1  overflow-y-auto">
//           {data?.scene_summaries?.map((summary, index) => (
//             <div
//               key={index}
//               onClick={() => handleSceneChange(summary.scene_data_id)}
//               className={`py-2 pl-1 pr-4 shadow-lg w-[80%] shadow-shadow-chat-button rounded-r-lg cursor-pointer ${
//                 selectedScene &&
//                 Number(selectedScene.scene_data_id) ===
//                   Number(summary.scene_data_id)
//                   ? "bg-blue-100"
//                   : "bg-white"
//               }`}
//             >
//               {index + 1}.
//             </div>
//           ))}
//         </div> */}
//         <div className="flex-1 flex justify-center pt-6">
//           <ScriptEditor />
//         </div>
//       </div>
//     </DisplayScriptLayout>
//   );
// };

// export default NScriptInput;
