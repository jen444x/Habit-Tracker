import { useState } from "react";
import HabitListItem from "./HabitListItem";

interface Habit {
  id: number;
  name: string;
  stage: number;
  curr_streak: number;
  tier: number;
  family_id: number;
  merged: boolean;
}

const stageIcons: Record<number, string> = {
  1: "🌱",
  2: "🌿",
  3: "🌸",
};

function StageIcon({ stage }: { stage: number }) {
  const icon = stageIcons[Math.min(stage, 3)] || "🌱";
  return <span className="text-sm">{icon}</span>;
}

interface MergedHabitGroupProps {
  familyMembers: Habit[];
  onComplete: () => void;
  selectedDate: string | null;
}

function MergedHabitGroup({
  familyMembers,
  onComplete,
  selectedDate,
}: MergedHabitGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function toggleExpanded() {
    setIsExpanded(!isExpanded);
  }

  // Build combined name
  let combinedName = "";
  for (let i = 0; i < familyMembers.length; i++) {
    if (i === 0) {
      combinedName = familyMembers[i].name;
    } else {
      combinedName = combinedName + " + " + familyMembers[i].name;
    }
  }

  // Get the last habit (newest, highest stage)
  const newestHabit = familyMembers[familyMembers.length - 1];

  // Find the habit with the lowest streak
  let lowestStreakHabit = familyMembers[0];
  for (let i = 1; i < familyMembers.length; i++) {
    if (familyMembers[i].curr_streak < lowestStreakHabit.curr_streak) {
      lowestStreakHabit = familyMembers[i];
    }
  }

  const displayStreak = lowestStreakHabit.curr_streak;

  // Use highest stage for display
  const displayStage = newestHabit.stage;

  function handleClick() {
    toggleExpanded();
  }

  async function handleComplete() {
    // Get all the habit IDs
    const habitIds: number[] = [];
    for (let i = 0; i < familyMembers.length; i++) {
      habitIds.push(familyMembers[i].id);
    }

    const url = `${import.meta.env.VITE_API_URL}/habits/complete-multiple`;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_ids: habitIds,
          date: selectedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
      }
      onComplete();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-1">
      {/* The merged habit card */}
      <li className="bg-white border border-calm-200 hover:border-calm-300 rounded-xl pl-2 pr-1.5 py-1.5 flex items-center gap-3 transition-colors">
        {/* Complete button */}
        <button onClick={handleComplete} className="p-1 -m-1 shrink-0">
          <span className="w-5 h-5 rounded-full border-2 border-calm-300 flex items-center justify-center transition-colors">
            {/* Empty checkbox */}
          </span>
        </button>

        {/* Habit name */}
        <span
          onClick={handleClick}
          className="flex-1 cursor-pointer leading-tight text-calm-900"
        >
          {combinedName}
        </span>

        {/* Stats badge */}
        <div className="bg-calm-50 rounded-lg px-3 py-2 flex items-center gap-3">
          {/* Stage icon */}
          <StageIcon stage={displayStage} />

          {/* Streak */}
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              displayStreak >= 7
                ? "text-red-500"
                : displayStreak >= 3
                  ? "text-orange-400"
                  : "text-calm-400"
            }`}
          >
            {displayStreak > 0 ? (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 23c-3.866 0-7-3.358-7-7.5 0-4.142 4-8.5 7-12.5 3 4 7 8.358 7 12.5 0 4.142-3.134 7.5-7 7.5zm0-3c1.933 0 3.5-1.567        
  3.5-3.5S13.933 13 12 13s-3.5 1.567-3.5 3.5S10.067 20 12 20z"
                  />
                </svg>
                {displayStreak}
              </>
            ) : (
              <span className="text-calm-300">💧</span>
            )}
          </span>
        </div>

        {/* Arrow button */}
        <button
          onClick={toggleExpanded}
          className="p-1 text-calm-400 hover:text-calm-600"
        >
          {isExpanded ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </li>

      {/* Individual habits - only show when expanded */}
      {isExpanded && (
        <div className="ml-8 space-y-1 border-l-2 border-calm-200 pl-3">
          {familyMembers.map(function (member) {
            return (
              <HabitListItem
                key={member.id}
                habit={member}
                onComplete={onComplete}
                status="incomplete"
                selectedDate={selectedDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MergedHabitGroup;

// import { useState } from "react";
// import HabitListItem from "./HabitListItem";
// import MergedHabitListItem from "./MergedHabitListItem";

// interface Habit {
//   id: number;
//   name: string;
//   stage: number;
//   curr_streak: number;
//   tier: number;
//   family_id: number;
//   merged: boolean;
//   title: string; // Add this
//   time_of_day: number; // Add this
// }

// interface MergedHabitGroupProps {
//   familyMembers: Habit[];
//   onComplete: () => void;
//   selectedDate: string | null;
// }

// function MergedHabitGroup({
//   familyMembers,
//   onComplete,
//   selectedDate,
// }: MergedHabitGroupProps) {
//   const [isExpanded, setIsExpanded] = useState(false);

//   function toggleExpanded() {
//     setIsExpanded(function (prev) {
//       return !prev;
//     });
//   }

//   // Get the newest habit (last in the array)
//   const newestHabit = familyMembers[familyMembers.length - 1];

//   // Build the combined name
//   let combinedName = "";
//   for (let j = 0; j < familyMembers.length; j++) {
//     if (j === 0) {
//       combinedName = familyMembers[j].name;
//     } else {
//       combinedName = combinedName + " + " + familyMembers[j].name;
//     }
//   }

//   // Get lowest streak (first habit since sorted)
//     const lowestStreak = familyMembers[0].curr_streak;

//     // Get highest stage (last habit)
//     const highestStage = familyMembers[familyMembers.length - 1].stage;

//   // Create a merged habit object with combined name but newest stats
//   const mergedHabit: Habit = {
//     id: newestHabit.id,
//     name: combinedName,
//     title: combinedName,
//     stage: newestHabit.stage,
//     tier: newestHabit.tier,
//     time_of_day: newestHabit.time_of_day,
//     curr_streak: newestHabit.curr_streak,
//     family_id: newestHabit.family_id,
//     merged: true,
//   };

//   return (
//     <div className="space-y-1">
//       {/* Main row with arrow and merged habit */}
//       <div className="flex items-center gap-2">

//         {/* The merged habit item */}
//         <div className="flex-1">
//           <MergedHabitListItem
//             habit={mergedHabit}
//             onComplete={onComplete}
//             status="incomplete"
//             selectedDate={selectedDate}
//             familyMembers={familyMembers}
//             isExpanded={isExpanded}
//             onToggle={toggleExpanded}
//           />
//         </div>
//       </div>

//       {/* Individual habits - only show when expanded */}
//       {isExpanded && (
//         <div className="ml-8 space-y-1 border-l-2 border-calm-200 pl-3">
//           {familyMembers.map(function (member) {
//             return (
//               <HabitListItem
//                 key={member.id}
//                 habit={member}
//                 onComplete={onComplete}
//                 status="incomplete"
//                 selectedDate={selectedDate}
//               />
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// export default MergedHabitGroup;
