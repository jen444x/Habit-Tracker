import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import HabitListItem from "./HabitListItem";
import DateNavigator from "../common/DateNavigator";
import MergedHabitGroup from "./MergedHabitGroup";

interface Habit {
  id: number;
  title: string;
  stage: number;
  tier: number;
  name: string;
  time_of_day: number;
  status?: "completed" | "skipped";
  curr_streak: number;
  family_id: number;
  merged: boolean;
}

interface ShowHabitsProps {
  selectedDate: string | null;
}

// One displayed row: either a single habit, or a merged family group
interface DisplayItem {
  key: string;
  habits: Habit[];
}

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Roots", color: "text-amber-700" },
  2: { label: "Growth", color: "text-green-600" },
  3: { label: "Flourish", color: "text-purple-600" },
};

const timeLabels: Record<number, { label: string; icon?: string }> = {
  0: { label: "Any Time" },
  1: { label: "Morning", icon: "☀" },
  2: { label: "Afternoon", icon: "◑" },
  3: { label: "Evening", icon: "☾" },
  4: { label: "Night", icon: "✦" },
};

function ShowHabits({ selectedDate }: ShowHabitsProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsDone, setHabitsDone] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prevDate, setPrevDate] = useState("");
  const [nextDate, setNextDate] = useState("");

  async function fetchHabits() {
    const url = `${import.meta.env.VITE_API_URL}/habits/tiers`;
    const fetchUrl = selectedDate ? `${url}?date=${selectedDate}` : url;
    const token = localStorage.getItem("token");

    setIsLoading(true);
    setHabits([]);
    setHabitsDone([]);

    try {
      const res = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setHabits(data.habits);
      setHabitsDone(data.habits_done);
      setPrevDate(data.prev_date);
      setNextDate(data.next_date);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, [selectedDate]);

  function groupHabitsByTier(habitsToGroup: Habit[]) {
    const groups: Record<number, Habit[]> = {};
    for (const habit of habitsToGroup) {
      const tier = habit.tier;
      if (groups[tier] === undefined) groups[tier] = [];
      groups[tier].push(habit);
    }
    return groups;
  }

  function groupHabitsByTime(habitsToGroup: Habit[]) {
    const groups: Record<number, Habit[]> = {};
    for (const habit of habitsToGroup) {
      const time = habit.time_of_day || 0;
      if (groups[time] === undefined) groups[time] = [];
      groups[time].push(habit);
    }
    return groups;
  }

  // Collapse a tier+time group's habits into displayed items, where merged
  // family members count as a single draggable.
  function buildDisplayItems(timeHabits: Habit[]): DisplayItem[] {
    const items: DisplayItem[] = [];
    const seenFamilies = new Set<number>();

    for (let i = 0; i < timeHabits.length; i++) {
      const habit = timeHabits[i];

      if (habit.merged === false) {
        items.push({ key: `h-${habit.id}`, habits: [habit] });
        continue;
      }

      if (seenFamilies.has(habit.family_id)) continue;

      const familyMembers: Habit[] = [];
      for (let j = 0; j < timeHabits.length; j++) {
        const other = timeHabits[j];
        if (other.merged && other.family_id === habit.family_id) {
          familyMembers.push(other);
        }
      }

      seenFamilies.add(habit.family_id);

      if (familyMembers.length < 2) {
        items.push({ key: `h-${habit.id}`, habits: [habit] });
      } else {
        items.push({
          key: `f-${habit.family_id}`,
          habits: familyMembers,
        });
      }
    }

    return items;
  }

  async function persistOrder(items: DisplayItem[]) {
    const payload = items.map((item) => item.habits.map((h) => h.id));
    const token = localStorage.getItem("token");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/habits/reorder`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: payload }),
      });
    } catch (err) {
      console.log(err);
    }
  }

  function handleDragEnd(
    event: DragEndEvent,
    tier: number,
    time: number,
    items: DisplayItem[],
  ) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((it) => it.key === active.id);
    const newIndex = items.findIndex((it) => it.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    // Splice the reordered group's habits back into the flat habits list,
    // preserving habits in other tier+time groups.
    const reorderedIds = new Set<number>();
    for (const item of reordered) {
      for (const h of item.habits) reorderedIds.add(h.id);
    }

    const newHabits: Habit[] = [];
    const reorderedFlat: Habit[] = [];
    for (const item of reordered) {
      for (const h of item.habits) reorderedFlat.push(h);
    }

    let insertedReordered = false;
    for (const h of habits) {
      const inGroup = h.tier === tier && (h.time_of_day || 0) === time;
      if (inGroup) {
        if (!insertedReordered) {
          newHabits.push(...reorderedFlat);
          insertedReordered = true;
        }
      } else {
        newHabits.push(h);
      }
    }

    setHabits(newHabits);
    persistOrder(reordered);
  }

  function renderHabitsByTier() {
    const habitsByTier = groupHabitsByTier(habits);
    const tierEntries = Object.entries(habitsByTier);

    return tierEntries.map(function (entry) {
      const tier = entry[0];
      const tierHabits = entry[1] as Habit[];

      const tierInfo = tierLabels[Number(tier)];
      const tierLabel = tierInfo ? tierInfo.label : `Tier ${tier}`;
      const tierColor = tierInfo ? tierInfo.color : "text-calm-500";

      return (
        <div key={tier} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h3
              className={`text-sm font-medium whitespace-nowrap ${tierColor}`}
            >
              {tierLabel}
            </h3>
            <div className="flex-1 h-px bg-calm-200"></div>
          </div>

          <div className="space-y-4">
            {renderHabitsByTime(Number(tier), tierHabits)}
          </div>
        </div>
      );
    });
  }

  function renderHabitsByTime(tier: number, tierHabits: Habit[]) {
    const habitsByTime = groupHabitsByTime(tierHabits);
    const timeEntries = Object.entries(habitsByTime);

    return timeEntries.map(function (entry) {
      const time = Number(entry[0]);
      const timeHabits = entry[1] as Habit[];
      const timeInfo = timeLabels[time];
      const items = buildDisplayItems(timeHabits);

      return (
        <div key={time}>
          {timeInfo && (
            <div className="flex items-center gap-1.5 mb-2 text-calm-400">
              {timeInfo.icon && (
                <span className="text-xs">{timeInfo.icon}</span>
              )}
              <span className="text-xs">{timeInfo.label}</span>
            </div>
          )}

          <SortableGroup
            tier={tier}
            time={time}
            items={items}
            onDragEnd={handleDragEnd}
            onComplete={fetchHabits}
            selectedDate={selectedDate}
          />
        </div>
      );
    });
  }

  if (!isLoading && habits.length === 0 && habitsDone.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <DateNavigator
          prevDate={prevDate}
          nextDate={nextDate}
          selectedDate={selectedDate}
        />
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-calm-500">No habits yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <DateNavigator
        prevDate={prevDate}
        nextDate={nextDate}
        selectedDate={selectedDate}
      />
      {isLoading && (
        <p className="text-center text-calm-500 mt-6">Loading habits...</p>
      )}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {habits.length > 0 && renderHabitsByTier()}

      {habitsDone.length > 0 && (
        <>
          {habits.length > 0 && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-calm-200"></div>
              <span className="text-calm-400 text-sm">Completed</span>
              <div className="flex-1 h-px bg-calm-200"></div>
            </div>
          )}
          <ul className="space-y-3">
            {habitsDone.map((habit: Habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onComplete={fetchHabits}
                status={habit.status || "completed"}
                selectedDate={selectedDate}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

interface SortableGroupProps {
  tier: number;
  time: number;
  items: DisplayItem[];
  onDragEnd: (
    event: DragEndEvent,
    tier: number,
    time: number,
    items: DisplayItem[],
  ) => void;
  onComplete: () => void;
  selectedDate: string | null;
}

function SortableGroup({
  tier,
  time,
  items,
  onDragEnd,
  onComplete,
  selectedDate,
}: SortableGroupProps) {
  // PointerSensor with small activation distance so taps still click through;
  // TouchSensor with delay so scrolling on mobile isn't hijacked.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => onDragEnd(event, tier, time, items)}
    >
      <SortableContext
        items={items.map((it) => it.key)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={item.key}
              item={item}
              onComplete={onComplete}
              selectedDate={selectedDate}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  item: DisplayItem;
  onComplete: () => void;
  selectedDate: string | null;
}

function SortableItem({ item, onComplete, selectedDate }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className="text-calm-300 hover:text-calm-500 cursor-grab active:cursor-grabbing touch-none shrink-0 -mr-0.5"
      aria-label="Drag to reorder"
      type="button"
    >
      <svg
        className="w-2.5 h-4"
        viewBox="0 0 8 16"
        fill="currentColor"
      >
        <circle cx="4" cy="3" r="1" />
        <circle cx="4" cy="8" r="1" />
        <circle cx="4" cy="13" r="1" />
      </svg>
    </button>
  );

  if (item.habits.length === 1) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center">
        {dragHandle}
        <div className="flex-1 min-w-0">
          <HabitListItem
            habit={item.habits[0]}
            onComplete={onComplete}
            status="incomplete"
            selectedDate={selectedDate}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      {dragHandle}
      <div className="flex-1 min-w-0">
        <MergedHabitGroup
          familyMembers={item.habits}
          onComplete={onComplete}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}

export default ShowHabits;
