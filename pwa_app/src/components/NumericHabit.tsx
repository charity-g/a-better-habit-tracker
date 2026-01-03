import { useState, useEffect, useRef } from "react";
import type { dailyHabits } from "../types/types";

interface NumericHabitProps {
    habit: dailyHabits;
    updateItem: (habit_name: string, patch: Partial<dailyHabits>) => void;
}

export default function NumericHabit(props: NumericHabitProps) {
    const [focus, setFocus] = useState(props.habit.Completed);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const target = scrollRef.current?.querySelector(`[data-level="${focus}"]`) as HTMLElement | null;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [focus]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                const items = Array.from(container.querySelectorAll<HTMLElement>("[data-level]"));
                if (!items.length) return;
                const { top, height } = container.getBoundingClientRect();
                const centerY = top + height / 2;
                let closest: { el: HTMLElement; distance: number } | null = null;

                items.forEach((el) => {
                    const rect = el.getBoundingClientRect();
                    const dist = Math.abs(rect.top + rect.height / 2 - centerY);
                    if (!closest || dist < closest.distance) closest = { el, distance: dist };
                });

                if (closest != null) {
                    const level = Number((closest as { el: HTMLElement; distance: number }).el.dataset.level);
                    setFocus(level);
                    props.updateItem(props.habit.Habit, { Completed: level });
                }
            }, 200);
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [props, props.habit.Habit, props.updateItem]);

    return (
        <div className="flex flex-col justify-center items-center">
             <label>{props.habit.Habit}</label>
        <div className="glass-card h-15 w-15 my-2 rounded-2xl flex flex-col justify-center items-center shadow-xl transition-transform duration-200">
            <div className="h-full w-full overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex flex-col overflow-y-auto scroll-smooth snap-mandatory hide-scrollbar-global"
                >

                    {Array.from({ length: (props.habit.MaxLevels) as number + 1 }, (_, index) => index).map((level) => (
                <div
                                key={level}
                                data-level={level}
                                className="shrink-0 h-15 w-full snap-center snap-always flex flex-col justify-center items-center cursor-pointer"
                                onClick={() => {
                                    setFocus(level);
                                    props.updateItem(props.habit.Habit, { Completed: level });
                                }}
                            >
                    <p className="text-center text-lg font-semibold text-white select-none">{level}</p>
                </div>))}
            </div>
            </div>
        </div>
        </div>
    );
}

