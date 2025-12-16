// import React, { useState, useRef, useEffect } from "react";
// import { Fountain } from "fountain-js";
// import { debounce } from "lodash";
// import {
//   sceneIntExtOptionList,
//   sceneShotTimeOptionList,
// } from "../../evaluation/constant";

// const fountain = new Fountain();

// const ScriptEditor = () => {
//   const [scriptText, setScriptText] = useState("");
//   const [parsedScript, setParsedScript] = useState([]);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     const handleTextChange = debounce(() => {
//       if (textareaRef.current) {
//         const text = textareaRef.current.value;
//         setScriptText(text);
//         const parsed = fountain.parse(text, true);
//         setParsedScript(parsed.tokens || []);
//       }
//     }, 300);

//     if (textareaRef.current) {
//       textareaRef.current.addEventListener("input", handleTextChange);
//     }

//     return () => {
//       if (textareaRef.current) {
//         textareaRef.current.removeEventListener("input", handleTextChange);
//       }
//     };
//   }, []);

//   const analyzeScript = (tokens) => {
//     const stats = {
//       acts: 0,
//       scenes: 0,
//       sceneHeadings: 0,
//       characters: new Set(),
//       dialogueBlocks: 0,
//       transitions: 0,
//     };

//     tokens.forEach((token) => {
//       switch (token.type) {
//         case "section":
//           if (token.text.toLowerCase().includes("act")) stats.acts++;
//           break;
//         case "scene_heading":
//           stats.sceneHeadings++;
//           stats.scenes++;
//           break;
//         case "character":
//           stats.characters.add(token.text.trim());
//           break;
//         case "dialogue_begin":
//           stats.dialogueBlocks++;
//           break;
//         case "transition":
//           stats.transitions++;
//           break;
//         default:
//           break;
//       }
//     });

//     return { ...stats, totalCharacters: stats.characters.size };
//   };

//   const scriptStats = analyzeScript(parsedScript);

//   const prepareDataForBackend = () => {
//     const scenes = [];
//     for (let i = 0; i < parsedScript.length; i++) {
//       const token = parsedScript[i];
//       if (token.type !== "scene_heading") continue;

//       const parts = token.text.match(
//         /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)\s+([^–-]+?)\s*[–-]\s*(.+)$/
//       );
//       if (!parts) continue;

//       const [_, interiorExterior, location, rawShotTime] = parts;

//       const sceneInteriorExteriorId =
//         sceneIntExtOptionList.find(
//           (opt) =>
//             opt.value.toLowerCase() ===
//             interiorExterior.replace(/\./g, "").replace("/", "/").toLowerCase()
//         )?.id || 0;

//       // Extract clean shot time by matching against the list
//       const cleanShotTime = sceneShotTimeOptionList.find((opt) =>
//         rawShotTime.toLowerCase().includes(opt.value.toLowerCase())
//       );
//       const sceneShotTimeId = cleanShotTime?.id || 0;

//       // Build scene summary from following tokens

//       let sceneSummary = "";
//       for (let j = i + 1; j < parsedScript.length; j++) {
//         const next = parsedScript[j];
//         if (next.type === "scene_heading") break;

//         if (!next?.text) continue; // skip undefined text

//         switch (next.type) {
//           case "action":
//             sceneSummary += `${next.text.trim()}\n`;
//             break;
//           case "character":
//             sceneSummary += `\n${next.text.trim().toUpperCase()}\n`;
//             break;
//           case "parenthetical":
//             sceneSummary += `(${next.text.trim()})\n`;
//             break;
//           case "dialogue":
//             sceneSummary += `${next.text.trim()}\n`;
//             break;
//           case "transition":
//             sceneSummary += `\n> ${next.text.trim()}\n`;
//             break;
//           default:
//             sceneSummary += `${next.text.trim()}\n`;
//         }
//       }
//       sceneSummary = sceneSummary.trim();

//       scenes.push({
//         scene_data_id: 0,
//         scene_sequence_no: scenes.length + 1,
//         scene_title: "Untitled Scene",
//         scene_interior_exterior: sceneInteriorExteriorId,
//         scene_location: location.trim(),
//         scene_summary: sceneSummary.trim(),
//         scene_shot_time: sceneShotTimeId,
//         action_type: "add",
//       });
//     }

//     return scenes;
//   };

//   const handleSubmit = () => {
//     const data = prepareDataForBackend();

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
//             <p key={idx} className="mx-12 italic">
//               {token.text}
//             </p>
//           );
//         default:
//           return <p key={idx}>{token.text}</p>;
//       }
//     });
//   };

//   const downloadFile = (format) => {
//     const blob = new Blob([scriptText], { type: `text/${format}` });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `script.${format}`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   const downloadPDF = () => {
//     // You can use a library like jsPDF to generate a PDF
//     // Example: https://github.com/parallax/jsPDF
//     alert("PDF download functionality not implemented yet.");
//   };

//   return (
//     <div className="flex flex-col  gap-6  font-sans ">
//       <div className="bg-gray-100  p-4 rounded-lg w-full  overflow-auto  flex  gap-4 items-start ">
//         <div className="flex-1">
//           <h2 className="text-xl font-bold mb-4">📘 Writing Guide</h2>
//           <ul className="list-disc list-inside text-sm space-y-1">
//             <li>
//               <strong>Scene Heading:</strong> Starts with `INT.` or `EXT.`
//             </li>
//             <li>
//               <strong>Action:</strong> Description of what's happening
//             </li>
//             <li>
//               <strong>Character:</strong> UPPERCASE before dialogue
//             </li>
//             <li>
//               <strong>Dialogue:</strong> Below character name
//             </li>
//             <li>
//               <strong>Transition:</strong> `CUT TO:` etc.
//             </li>
//             <li>
//               <strong>Section:</strong> `# Act 1` etc.
//             </li>
//           </ul>
//         </div>
//         <div className="flex-1">
//           <h2 className="text-xl font-bold mt-6 mb-4">📊 Script Stats</h2>
//           <ul className="text-sm flex gap-4 ">
//             <li>
//               <strong>Acts:</strong> {scriptStats.acts}
//             </li>
//             <li>
//               <strong>Scenes:</strong> {scriptStats.scenes}
//             </li>
//             <li>
//               <strong>Total Characters:</strong> {scriptStats.totalCharacters}
//             </li>
//           </ul>
//         </div>

//         <button
//           onClick={handleSubmit}
//           className="mt-6  bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//         >
//           Submit
//         </button>

//         <div className="flex gap-2 mt-6">
//           <button
//             onClick={() => downloadFile("txt")}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//           >
//             Download TXT
//           </button>
//           <button
//             onClick={() => downloadFile("fdx")}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
//           >
//             Download FDX
//           </button>
//           {/* <button
//             onClick={downloadPDF}
//             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//           >
//             Download PDF
//           </button> */}
//         </div>
//       </div>

//       {/* Right Panel - Editor */}
//       <div className="w-full flex  gap-6">
//         <div className="border border-gray-300 flex-1  rounded-lg p-2 h-[45vh] overflow-y-auto">
//           <textarea
//             ref={textareaRef}
//             className="p-2 w-full h-full"
//             placeholder="Write your script in Fountain format here..."
//           />
//         </div>

//         <div className="bg-white border rounded-lg p-4 overflow-auto h-[45vh] flex-1 ">
//           <h2 className="font-bold mb-2">📝 Preview</h2>
//           <div className="prose prose-sm">
//             {renderFormattedScript(parsedScript)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScriptEditor;
