// import { useNavigate } from "react-router";
// import { useState } from "react";

// interface Habit {
//   id: number;
//   name: string;
//   stage: number;
//   curr_streak: number;
//   tier: number;
//   family_id: number;
// }

// const stageIcons: Record<number, string> = {
//   1: "🌱",
//   2: "🌿",
//   3: "🌸",
// };

// function StageIcon({ stage }: { stage: number }) {
//   const icon = stageIcons[Math.min(stage, 3)] || "🌱";
//   return <span className="text-sm">{icon}</span>;
// }

// interface MergedHabitListItemProps {
//   habit: Habit;
//   onComplete: () => void;
//   status: "incomplete" | "completed" | "skipped";
//   selectedDate: string | null;
//   familyMembers: Habit[];
//   isExpanded: boolean;
//   onToggle: () => void;
// }

// function MergedHabitListItem({
//   habit,
//   onComplete,
//   status,
//   selectedDate,
//   familyMembers,
//   isExpanded,
//   onToggle,
// }: MergedHabitListItemProps) {
//   const navigate = useNavigate();
//   // Get the first habit (has the lowest streak since sorted)
//   const firstHabit = familyMembers[0];
//   async function handleClick() {
//     // go to first habit page
//     navigate(`/${firstHabit.id}`);
//   }

//   function toggleExpanded() {
//     setIsExpanded(function (prev) {
//       return !prev;
//     });
//   }

//   async function handleChange() {
//     // Get all the habit IDs
//     const habitIds: number[] = [];
//     for (let i = 0; i < familyMembers.length; i++) {
//       habitIds.push(familyMembers[i].id);
//     }

//     const url = `${import.meta.env.VITE_API_URL}/habits/complete-multiple`;
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           habit_ids: habitIds,
//           date: selectedDate,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         console.log(data.error);
//       }
//       onComplete();
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   // Styles based on status
//   const borderStyle = {
//     incomplete: "border-calm-200 hover:border-calm-300",
//     completed: "border-calm-100",
//     skipped: "border-calm-100",
//   }[status];

//   const checkboxStyle = {
//     incomplete: "border-calm-300",
//     completed: "bg-calm-500 border-calm-500 text-white",
//     skipped: "border-dashed border-calm-300",
//   }[status];

//   const textStyle = {
//     incomplete: "text-calm-900",
//     completed: "text-calm-400 line-through",
//     skipped: "text-calm-400 italic",
//   }[status];

//   return (
//     <li
//       className={`bg-white border rounded-xl pl-4 pr-1.5 py-1.5 flex items-center gap-3 transition-colors ${borderStyle}`}
//     >
//       {/* Complete button */}
//       <button onClick={handleChange} className="p-1 -m-1 shrink-0">
//         <span
//           className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checkboxStyle}`}
//         >
//           {status === "completed" && (
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={3}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           )}
//           {status === "skipped" && (
//             <svg
//               className="w-3 h-3 text-calm-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 5l7 7-7 7M5 5l7 7-7 7"
//               />
//             </svg>
//           )}
//         </span>
//       </button>

//       {/* Habit name */}
//       <span
//         onClick={handleClick}
//         className={`flex-1 cursor-pointer leading-tight ${textStyle}`}
//       >
//         {habit.name}
//       </span>

//       {/* Dropdown arrow button */}

//       <button
//         onClick={onToggle}
//         className="p-1 text-calm-400 hover:text-calm-600"
//       >
//         {isExpanded === true ? (
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 9l-7 7-7-7"
//             />
//           </svg>
//         ) : (
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9 5l7 7-7 7"
//             />
//           </svg>
//         )}
//       </button>

//       {/* Stats badge */}
//       <div className="bg-calm-50 rounded-lg px-3 py-2 flex items-center gap-3">
//         {/* Stage icon */}
//         <StageIcon stage={habit.stage} />

//         {/* Streak */}
//         <span
//           className={`flex items-center gap-0.5 text-xs font-medium ${
//             habit.curr_streak >= 7
//               ? "text-red-500"
//               : habit.curr_streak >= 3
//                 ? "text-orange-400"
//                 : "text-calm-400"
//           }`}
//         >
//           {habit.curr_streak > 0 ? (
//             <>
//               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M12 23c-3.866 0-7-3.358-7-7.5 0-4.142 4-8.5 7-12.5 3 4 7 8.358 7 12.5 0 4.142-3.134 7.5-7 7.5zm0-3c1.933 0 3.5-1.567 3.5-3.5S13.933 13 12 13s-3.5 1.567-3.5 3.5S10.067 20 12 20z" />
//               </svg>
//               {habit.curr_streak}
//             </>
//           ) : (
//             <span className="text-calm-300">💧</span>
//           )}
//         </span>
//       </div>
//     </li>
//   );
// }

// export default MergedHabitListItem;
