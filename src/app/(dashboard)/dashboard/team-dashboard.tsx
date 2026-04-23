'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Users, 
  Target, 
  MessageCircle, 
  Calendar, 
  Zap, 
  ChevronRight, 
  Settings 
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

type TeamInsights = {
  teamName: string;
  teamLeader: string;
  memberCount: number;
  yourRank: number;
  topPerformer: {
    name: string;
    metric: string;
  };
  teamGoal: {
    current: number;
    target: number;
    percentage: number;
  };
  yourContribution: {
    percentage: number;
    description: string;
  };
  recentWin: {
    title: string;
    date: Date;
  };
  announcement?: {
    message: string;
    createdAt: string;
    createdBy: string;
  } | null;
  recognition?: {
    message: string;
    createdAt: string;
    createdBy: string;
  } | null;
};

type TeamMemberDashboardProps = {
  userId: string;
  isTeamLeader: boolean;
};

export default function TeamMemberDashboard({ userId, isTeamLeader }: TeamMemberDashboardProps) {
  const [insights, setInsights] = useState<TeamInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, resolvedTheme } = useTheme();
  const isDarkTheme = theme === 'dark' || resolvedTheme === 'dark';

  // Fetch team insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/insights?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.insights) {
          setInsights(data.insights);
        } else {
          console.error('Failed to load team insights:', data.error);
        }
      } catch (error) {
        console.error('Error fetching team insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  if (loading) {
    return (
      <div className="mt-10 space-y-8">
        <div className="animate-pulse bg-indigo-800/70 border border-indigo-700/50 h-40 rounded-lg"></div>
        <div className="animate-pulse bg-indigo-800/70 border border-indigo-700/50 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="mt-10 p-6 bg-indigo-800/70 border border-indigo-700/50 rounded-lg">
        <h2 className="text-xl font-bold mb-2 text-indigo-300">No Team Data Available</h2>
        <p className="text-indigo-400">You are not currently part of a team. Contact your administrator for more information.</p>
      </div>
    );
  }

  // Format date for announcements and recognition
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="mt-10 space-y-8">
      {/* Team Overview Card */}
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

      {/* Team Announcement (if available) */}
      {insights.announcement && (
        <Card className="border-indigo-700/50 bg-indigo-800/70">
          <CardHeader className="pb-2">
            <CardTitle>Team Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-4 border border-indigo-700/30 bg-indigo-700/40">
              <p className="whitespace-pre-line">{insights.announcement.message}</p>
              <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                <span>Posted by {insights.announcement.createdBy}</span>
                <span>{formatDate(insights.announcement.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Recognition (if available) */}
      {insights.recognition && (
        <Card className="border-indigo-700/50 bg-indigo-800/70">
          <CardHeader className="pb-2">
            <CardTitle>Team Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-4 border border-indigo-700/30 bg-indigo-700/40">
              <p>{insights.recognition.message}</p>
              <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                <span>Recognition by {insights.recognition.createdBy}</span>
                <span>{formatDate(insights.recognition.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="border-indigo-700/50 bg-indigo-800/70">
        <CardHeader className="pb-2">
          <CardTitle>Team Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/team" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-indigo-400 mr-3" />
                <span>Team Members</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="/chat" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-indigo-400 mr-3" />
                <span>Team Chat</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="/calendar" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-indigo-400 mr-3" />
                <span>Team Calendar</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 