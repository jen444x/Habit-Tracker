import { useNavigate } from "react-router";

type Challenge = {
  id: number;
  title: string;
  body: string;
};

interface ChallengeListItemProps {
  challenge: Challenge;
}

function ChallengeListItem({ challenge }: ChallengeListItemProps) {
  const navigate = useNavigate();
  async function handleClick() {
    // go to single challenge page
    navigate(`${challenge.id}`);
  }

  return (
    <li
      onClick={handleClick}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-calm-400"></div>
        <h3 className="flex-1 font-medium text-calm-900">{challenge.title}</h3>
        <svg
          className="w-5 h-5 text-calm-300"
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
      </div>
    </li>
  );
}

export default ChallengeListItem;
