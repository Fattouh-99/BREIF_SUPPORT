"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunicationProps {
  message: string;
  createdAt: string;
  createdBy: string;
  type: "announcement" | "recognition";
  loading?: boolean;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export function TeamCommunication({ message, createdAt, createdBy, type, loading = false }: CommunicationProps) {
  const title = type === "announcement" ? "Team Announcement" : "Team Recognition";
  const byText = type === "announcement" ? "Posted by" : "Recognition by";
  
  if (loading) {
    return (
      <Card className="border-indigo-700/50 bg-indigo-800/70">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-700/50 bg-indigo-800/70">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg p-4 border border-indigo-700/30 bg-indigo-700/40">
          <p className="whitespace-pre-line">{message}</p>
          <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
            <span>{byText} {createdBy}</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 