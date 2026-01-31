import type { Challenge } from "../api";

interface ChallengeTabsProps {
  challenges: Challenge[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

function ChallengeTabs({ challenges, selectedId, onSelect }: ChallengeTabsProps) {
  if (challenges.length === 0) return null;

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 justify-center">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-150 ${
          selectedId === null
            ? "bg-calm-500 text-white"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {challenges.map((challenge) => (
        <button
          key={challenge.id}
          onClick={() => onSelect(challenge.id)}
          className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-150 ${
            selectedId === challenge.id
              ? "bg-calm-500 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {challenge.title}
        </button>
      ))}
    </div>
  );
}

export default ChallengeTabs;
