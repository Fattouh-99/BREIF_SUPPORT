import CalIcon from '@/icons/cal-icon'
import ChatIcon from '@/icons/chat-icon'
import DashboardIcon from '@/icons/dashboard-icon'
import EmailIcon from '@/icons/email-icon'
import HelpDeskIcon from '@/icons/help-desk-icon'
import IntegrationsIcon from '@/icons/integrations-icon'
import ProductIcon from '@/icons/product-icon'
import SettingsIcon from '@/icons/settings-icon'
import StarIcon from '@/icons/star-icon'
import TeamIcon from '@/icons/team-icon'
import TimerIcon from '@/icons/timer-icon'
import { 
  Headphones as SupportIcon, 
  ShieldAlert, 
  Users, 
  Tag, 
  FileText, 
  Briefcase, 
  ClipboardList, 
  Database, 
  BarChart,
  Home,
  MessageCircle,
  HelpCircle,
  ShoppingBag
} from 'lucide-react'

type SIDE_BAR_MENU_PROPS = {
  label: string
  icon: JSX.Element
  path: string
  adminOnly?: boolean
}

export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: 'dashboard',
  },
  {
    label: 'Conversations',
    icon: <ChatIcon />,
    path: 'conversation',
  },
  {
    label: 'Team',
    icon: <TeamIcon />,
    path: 'team',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: 'settings',
  },
  // {
  //   label: 'Appointments',
  //   icon: <CalIcon />,
  //   path: 'appointment',
  // },
  {
    label: 'Email Marketing',
    icon: <EmailIcon />,
    path: 'email-marketing',
  },
  // Admin sections - separated into individual tabs
  {
    label: 'Admin Overview',
    icon: <ShieldAlert size={18} />,
    path: 'admin',
    adminOnly: true,
  },
  {
    label: 'Content Tags',
    icon: <Tag size={18} />,
    path: 'admin/tags',
    adminOnly: true,
  },
  {
    label: 'Blog Posts',
    icon: <FileText size={18} />,
    path: 'admin/blogs',
    adminOnly: true,
  },
  {
    label: 'Job Listings',
    icon: <Briefcase size={18} />,
    path: 'admin/jobs',
    adminOnly: true,
  },
  {
    label: 'Applications',
    icon: <ClipboardList size={18} />,
    path: 'admin/applications',
    adminOnly: true,
  },
  {
    label: 'Categories',
    icon: <Database size={18} />,
    path: 'admin/categories',
    adminOnly: true,
  },
]

type TABS_MENU_PROPS = {
  label: string
  icon?: JSX.Element
}

export const TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'unread',
    icon: <EmailIcon />,
  },
  {
    label: 'all',
    icon: <EmailIcon />,
  },
  {
    label: 'Live',
    icon: <SupportIcon />,
  },
  // {
  //   label: 'Expired',
  //   icon: <StarIcon />,
  // },
]

export const HELP_DESK_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'help desk',
  },
  {
    label: 'questions',
  },
  {
    label: 'configuration',
  },
]

export const APPOINTMENT_TABLE_HEADER = [
  'Name',
  'RequestedTime',
  'Added Time',
  'Domain',
]

export const EMAIL_MARKETING_HEADER = ['Id', 'Email', 'Domain']

export const BOT_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: 'home',
    icon: <Home size={18} strokeWidth={2.5} />,
  },
  {
    label: 'chat',
    icon: <MessageCircle size={18} strokeWidth={2.5} />,
  },
  {
    label: 'helpdesk',
    icon: <HelpCircle size={18} strokeWidth={2.5} />,
  },
  {
    label: 'products',
    icon: <ShoppingBag size={18} strokeWidth={2.5} />,
  },
]
