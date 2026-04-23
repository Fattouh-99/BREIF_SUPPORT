// Topic distribution types
export interface Topic {
  topic: string;
  count: number;
  percentage: number;
}

// Conversion metrics types
export interface ConversionMetrics {
  totalConversations?: number;
  emailCaptureRate?: number;
  bookingConversionRate?: number;
  leadGenerationRate?: number;
  averageMessagesBeforeConversion?: number;
}

export type TeamInsights = {
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
  conversionMetrics?: ConversionMetrics;
  topicDistribution?: {
    totalMessages?: number;
    topics?: Topic[];
  };
};

export type TeamMemberDashboardProps = {
  userId: string;
  isTeamLeader: boolean;
}; 