"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Target, Users } from "lucide-react";
import { TeamInsights } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMetricsProps {
  insights: TeamInsights;
  loading?: boolean;
}

export function TeamMetrics({ insights, loading = false }: TeamMetricsProps) {
  if (loading) {
    return (
      <Card className="border-indigo-700/50 bg-indigo-800/70 h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-700/50 bg-indigo-800/70 h-full">
      <CardHeader className="pb-2">
        <CardTitle>Team Metrics</CardTitle>
        <CardDescription className="text-indigo-300">
          Key performance indicators for your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-indigo-700/30 p-4 rounded-lg border border-indigo-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-300">Team Satisfaction Score</p>
                <p className="text-2xl font-bold text-white">98%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-700/30 p-4 rounded-lg border border-indigo-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-300">Response Time</p>
                <p className="text-2xl font-bold text-white">1.2 hrs</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-indigo-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-700/30 p-4 rounded-lg border border-indigo-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-300">Goal Completion</p>
                <p className="text-2xl font-bold text-white">{insights.teamGoal.percentage}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-indigo-300" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 