"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Zap, Settings } from "lucide-react";
import { TeamInsights } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamOverviewProps {
  insights: TeamInsights;
  isTeamLeader: boolean;
  loading?: boolean;
}

export function TeamOverview({ insights, isTeamLeader, loading = false }: TeamOverviewProps) {
  if (loading) {
    return (
      <Card className="border-indigo-700/50 bg-indigo-800/70">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-700/50 bg-indigo-800/70">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Team Overview</CardTitle>
          {isTeamLeader && (
            <Button variant="outline" size="sm" className="bg-indigo-900/30 border-indigo-800/50 text-indigo-300">
              <Settings className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-900/70 flex items-center justify-center text-indigo-200 font-bold">
              {insights.teamName.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{insights.teamName}</h3>
              <p className="text-sm text-muted-foreground">Led by {insights.teamLeader}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{insights.memberCount} members</div>
            <p className="text-sm text-muted-foreground">Your rank: #{insights.yourRank}</p>
          </div>
        </div>

        {/* Team Goal Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <div className="font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-indigo-400" />
              Team Goal Progress
            </div>
            <div className="text-sm text-muted-foreground">
              {insights.teamGoal.current} / {insights.teamGoal.target} new clients
            </div>
          </div>
          <Progress value={insights.teamGoal.percentage} className="h-2 bg-indigo-950" />
          <p className="text-sm text-muted-foreground">
            {insights.teamGoal.percentage}% complete - You've contributed {insights.yourContribution.percentage}%
          </p>
        </div>

        {/* Top Performer */}
        <div className="bg-indigo-700/50 rounded-lg p-4 mb-4 border border-indigo-600/30">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm">
                <span className="font-medium text-indigo-300">{insights.topPerformer.name}</span> is this month's top performer with{' '}
                <span className="font-medium text-indigo-300">{insights.topPerformer.metric}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Win */}
        <div className="mt-4">
          <div className="font-medium mb-2 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Your Recent Win
          </div>
          <p className="text-sm">{insights.recentWin.title}</p>
        </div>
      </CardContent>
    </Card>
  );
} 