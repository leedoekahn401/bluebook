"use client";

import React, { useMemo } from "react";

interface ActivityHeatmapProps {
    results: any[];
}

export default function ActivityHeatmap({ results }: ActivityHeatmapProps) {
    const { heatmapData, maxActivity } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (29 - i));
            return d;
        });

        const activityMap = new Map<string, number>();

        // Count tests per day based on createdAt or date
        results.forEach((result) => {
            const resultDate = new Date(result.createdAt || result.date || result.updatedAt);
            resultDate.setHours(0, 0, 0, 0);
            const dateKey = resultDate.toISOString().split("T")[0];
            activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
        });

        let maxAct = 0;
        const data = last30Days.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const count = activityMap.get(dateKey) || 0;
            if (count > maxAct) maxAct = count;
            return { date, count, dateKey };
        });

        return { heatmapData: data, maxActivity: maxAct };
    }, [results]);

    const getColorClass = (count: number) => {
        if (count === 0) return "bg-slate-100 dark:bg-slate-800";
        if (count === 1) return "bg-blue-300 dark:bg-blue-900";
        if (count === 2) return "bg-blue-400 dark:bg-blue-700";
        if (count === 3) return "bg-blue-500 dark:bg-blue-600";
        return "bg-blue-600 dark:bg-blue-500";
    };

    return (
        <div className="w-full h-full flex flex-col justify-end pt-2">

            <div className="flex flex-col items-center w-full pb-1">
                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center w-full">
                    {heatmapData.map((day, i) => (
                        <div
                            key={day.dateKey}
                            className="group relative"
                        >
                            <div
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm shrink-0 transition-colors duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 ${getColorClass(
                                    day.count
                                )}`}
                            />
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded pointer-events-none whitespace-nowrap z-10 w-auto">
                                {day.count} test{day.count !== 1 ? 's' : ''} on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
