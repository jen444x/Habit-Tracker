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
        <h3 className="flex-1 font-medium text-stone-900">{challenge.title}</h3>
      </div>
    </li>
  );
}

export default ChallengeListItem;
