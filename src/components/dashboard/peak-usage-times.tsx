import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  AlertCircle, 
  ArrowDownUp, 
  CalendarDays, 
  BarChart2, 
  CalendarClock 
} from 'lucide-react';

interface PeakUsageTimesProps {
  usageData: {
    hourlyUsage: number[];
    dailyUsage: number[];
    hourlyUsageByDay: number[][];
    busiestHour: string;
    busiestDay: string;
    busiestTime: string;
    totalMessages: number;
    dayNames: string[];
  } | null;
  isLoading?: boolean;
}

const PeakUsageTimesCard = ({ usageData, isLoading = false }: PeakUsageTimesProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Peak Usage Times
          </CardTitle>
          <CardDescription className="text-xs">
            When your chatbot receives the most traffic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Peak Usage Times
          </CardTitle>
          <CardDescription className="text-xs">
            When your chatbot receives the most traffic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No usage data available yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Data will appear as visitors interact with your chatbot
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the maximum value in the heatmap to normalize colors
  const maxValue = Math.max(...usageData.hourlyUsageByDay.flatMap(day => day));

  // Helper function to determine color intensity based on value
  const getColorIntensity = (value: number) => {
    if (maxValue === 0) return 'bg-blue-50 dark:bg-blue-900/5';
    const intensity = Math.min(Math.max(Math.floor((value / maxValue) * 9) + 1, 1), 9) * 100;
    return `bg-blue-${intensity} dark:bg-blue-${intensity}/80`;
  };

  // Get the top 3 busiest hours with their counts
  const topHours = usageData.hourlyUsage
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item,
      formattedHour: formatHour(item.hour)
    }));

  // Get the top 3 busiest days with their counts
  const topDays = usageData.dailyUsage
    .map((count, day) => ({ day, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item,
      dayName: usageData.dayNames[item.day]
    }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Peak Usage Times
        </CardTitle>
        <CardDescription className="text-xs">
          Based on {usageData.totalMessages} conversations in the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key statistics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Busiest Hour</span>
            </div>
            <p className="text-sm font-medium">{usageData.busiestHour}</p>
          </div>
          
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Busiest Day</span>
            </div>
            <p className="text-sm font-medium">{usageData.busiestDay}</p>
          </div>
          
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Peak Time</span>
            </div>
            <p className="text-sm font-medium truncate">{usageData.busiestTime}</p>
          </div>
        </div>

        {/* Heatmap visualization */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between px-1 mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Hour / Day</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-blue-100 dark:bg-blue-900/20 rounded-sm"></span>
              <ArrowDownUp className="h-3 w-3 text-gray-400" />
              <span className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-sm"></span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Volume</span>
            </div>
          </div>
          
          <div className="grid grid-cols-8 gap-1 text-[9px] text-center">
            <div className="flex items-center justify-center"></div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="py-1 px-0.5">{day}</div>
            ))}
          </div>
          
          {/* Only show a subset of hours for a more compact view */}
          {[0, 4, 8, 12, 16, 20].map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1 text-[9px]">
              <div className="flex items-center justify-end pr-1.5 text-gray-500">{formatCompactHour(hour)}</div>
              {usageData.hourlyUsageByDay.map((day, dayIndex) => (
                <div 
                  key={dayIndex}
                  className={`w-full aspect-square rounded-sm ${getColorIntensity(day[hour])}`}
                  title={`${usageData.dayNames[dayIndex]} at ${formatHour(hour)}: ${day[hour]} chats`}
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 text-sm space-y-1">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Key Insights:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pl-5 list-disc">
            {topDays.length > 0 && (
              <li>
                Your busiest days are {topDays.map(d => d.dayName).join(', ')}
              </li>
            )}
            {topHours.length > 0 && (
              <li>
                Most active hours are {topHours.map(h => h.formattedHour).join(', ')}
              </li>
            )}
            <li>
              Consider scheduling team availability during peak hours
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format hour to 12-hour format with AM/PM
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

// More compact hour format for the heatmap
function formatCompactHour(hour: number): string {
  if (hour === 0) return '12a';
  if (hour === 12) return '12p';
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export default PeakUsageTimesCard; 