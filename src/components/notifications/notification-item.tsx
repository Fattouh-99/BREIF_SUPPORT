import { Bell, CheckCircle, Settings, Users, Share2, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

type NotificationType = 
  | 'DOMAIN_SETUP'
  | 'DOMAIN_ACCESS'
  | 'LIVE_SUPPORT'
  | 'NAME_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'PLAN_UPGRADE'
  | 'TEAM_INVITATION'
  | 'TEAM_ROLE_UPDATE'
  | 'TEAM_MESSAGE'
  | 'TRANSFER_REQUEST'
  | 'SHARED_CONVERSATION';

type NotificationItemProps = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: string;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'DOMAIN_SETUP':
      return <Settings className="w-4 h-4" />;
    case 'LIVE_SUPPORT':
      return <Bell className="w-4 h-4" />;
    case 'NAME_CHANGE':
    case 'PASSWORD_CHANGE':
      return <CheckCircle className="w-4 h-4" />;
    case 'TEAM_INVITATION':
    case 'TEAM_ROLE_UPDATE':
      return <Users className="w-4 h-4" />;
    case 'TEAM_MESSAGE':
      return <Megaphone className="w-4 h-4" />;
    case 'SHARED_CONVERSATION':
      return <Share2 className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationAction = (type: NotificationType, metadata?: string) => {
  switch (type) {
    case 'TEAM_INVITATION':
      return {
        label: 'View Invitation',
        href: '/team'
      };
    case 'TEAM_MESSAGE':
      return {
        label: 'View Announcement',
        href: '/conversation'
      };
    case 'SHARED_CONVERSATION':
      if (metadata) {
        const data = JSON.parse(metadata);
        return {
          label: 'View Conversation',
          href: `/conversation?chatId=${data.chatRoomId}`
        };
      }
      return {
        label: 'View Conversation',
        href: '/conversation'
      };
    default:
      return null;
  }
};

export default function NotificationItem({
  type,
  message,
  read,
  createdAt,
  metadata
}: NotificationItemProps) {
  const icon = getNotificationIcon(type);
  const action = getNotificationAction(type, metadata);

  return (
    <div className={`flex items-start gap-4 p-4 ${!read ? 'bg-gray-50' : ''}`}>
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(createdAt).toLocaleString()}
        </p>
        {action && (
          <div className="mt-2">
            <Link href={action.href}>
              <Button variant="outline" size="sm">
                {action.label}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 