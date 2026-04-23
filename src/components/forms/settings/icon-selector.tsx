import { BotIcons, BotIconType } from '@/icons/bot-icons'
import { cn } from '@/lib/utils'

interface IconSelectorProps {
  selectedIcon: BotIconType
  onSelectIcon: (icon: BotIconType) => void
  iconColor: string
}

const IconSelector = ({ selectedIcon, onSelectIcon, iconColor }: IconSelectorProps) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
      {Object.entries(BotIcons).map(([iconName, IconComponent]) => (
        <div
          key={iconName}
          onClick={() => onSelectIcon(iconName as BotIconType)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            selectedIcon === iconName && "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <div 
            className="rounded-full p-3"
            style={{ backgroundColor: iconColor }}
          >
            <IconComponent className="w-8 h-8" color="white" />
          </div>
          <span className="text-sm">{iconName}</span>
        </div>
      ))}
    </div>
  )
}

export default IconSelector 