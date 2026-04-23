"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronRight, MessageCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamResourcesProps {
  loading?: boolean;
}

export function TeamResources({ loading = false }: TeamResourcesProps) {
  if (loading) {
    return (
      <Card className="border-indigo-700/50 bg-indigo-800/70">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-700/50 bg-indigo-800/70">
      <CardHeader className="pb-2">
        <CardTitle>Team Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/team" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-indigo-400 mr-3" />
              <span>Team Members</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
          <a href="/chat" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 text-indigo-400 mr-3" />
              <span>Team Chat</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
          <a href="/calendar" className="bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg p-4 border border-indigo-600/30 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-indigo-400 mr-3" />
              <span>Team Calendar</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
} 