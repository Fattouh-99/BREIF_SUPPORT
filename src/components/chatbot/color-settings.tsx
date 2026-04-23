import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { COLOR_DESCRIPTIONS } from './theme-helpers';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Info, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ColorOption = {
  id: string;
  name: string;
  description: string;
  default: string;
  value: string;
  affects: string[];
}

interface ChatbotColorSettingsProps {
  colors: {
    themeColor: string | null;
    textColor: string | null;
    titleColor: string | null;
    helpDeskColor: string | null;
    background: string | null;
    iconColor: string | null;
    bubbleBackground: string | null;
  };
  onChange: (colorId: string, value: string) => void;
  compact?: boolean;
}

export default function ChatbotColorSettings({ colors, onChange, compact = false }: ChatbotColorSettingsProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  
  // Get color description from our central config
  const getColorInfo = (colorId: string) => {
    const info = COLOR_DESCRIPTIONS[colorId as keyof typeof COLOR_DESCRIPTIONS];
    return info || {
      name: colorId,
      description: 'A color used in the chatbot',
      affects: []
    };
  };

  const colorOptions: ColorOption[] = [
    {
      id: 'themeColor',
      name: getColorInfo('themeColor').name,
      description: getColorInfo('themeColor').description,
      default: '#6366F1', // Indigo
      value: colors.themeColor || '#6366F1',
      affects: getColorInfo('themeColor').affects
    },
    {
      id: 'background',
      name: getColorInfo('background').name, 
      description: getColorInfo('background').description,
      default: '#FFFFFF', // White
      value: colors.background || '#FFFFFF',
      affects: getColorInfo('background').affects
    },
    {
      id: 'bubbleBackground',
      name: getColorInfo('bubbleBackground').name, 
      description: getColorInfo('bubbleBackground').description,
      default: '#FFFFFF', // White
      value: colors.bubbleBackground || '#FFFFFF',
      affects: getColorInfo('bubbleBackground').affects
    },
    {
      id: 'textColor',
      name: getColorInfo('textColor').name,
      description: getColorInfo('textColor').description,
      default: '#4B5563', // Gray 600
      value: colors.textColor || '#4B5563',
      affects: getColorInfo('textColor').affects
    },
    {
      id: 'titleColor',
      name: getColorInfo('titleColor').name,
      description: getColorInfo('titleColor').description,
      default: '#1F2937', // Gray 800
      value: colors.titleColor || '#1F2937',
      affects: getColorInfo('titleColor').affects
    },
    {
      id: 'helpDeskColor',
      name: getColorInfo('helpDeskColor').name,
      description: getColorInfo('helpDeskColor').description,
      default: '#F3F4F6', // Gray 100
      value: colors.helpDeskColor || '#F3F4F6',
      affects: getColorInfo('helpDeskColor').affects
    },
    {
      id: 'iconColor',
      name: getColorInfo('iconColor').name,
      description: getColorInfo('iconColor').description,
      default: '#6366F1', // Indigo
      value: colors.iconColor || '#6366F1',
      affects: getColorInfo('iconColor').affects
    }
  ];

  const handleColorChange = (colorId: string, value: string) => {
    onChange(colorId, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {colorOptions.map((option) => (
          <div 
            key={option.id}
            className={cn(
              "relative border rounded-md p-3 transition-all",
              activeColor === option.id ? "border-primary shadow-sm" : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border"
                  style={{ 
                    backgroundColor: option.value,
                    borderColor: option.value === '#FFFFFF' ? '#E5E7EB' : 'transparent'
                  }}
                ></div>
                <h3 className="text-sm font-medium">{option.name}</h3>
              </div>
              
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <div className="space-y-2">
                      <p className="text-xs">{option.description}</p>
                      {option.affects.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Affects:</p>
                          <ul className="text-xs space-y-0.5 list-disc list-inside">
                            {option.affects.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2">
              <Popover open={activeColor === option.id} onOpenChange={(open) => setActiveColor(open ? option.id : null)}>
                <PopoverTrigger asChild>
                  <button
                    className="w-full h-9 px-2 rounded-md border flex items-center text-left text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-primary"
                    style={{ 
                      backgroundColor: option.value,
                      color: option.value === '#FFFFFF' ? '#1F2937' : getContrastColor(option.value)
                    }}
                  >
                    {option.value.toUpperCase()}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="space-y-3">
                    <HexColorPicker
                      color={option.value}
                      onChange={(color: string) => handleColorChange(option.id, color)}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Default:</span>
                      <button
                        onClick={() => handleColorChange(option.id, option.default)}
                        className="text-xs px-1.5 py-0.5 rounded border hover:bg-muted/50 flex items-center gap-1 transition-colors"
                        style={{ borderColor: option.default === '#FFFFFF' ? '#E5E7EB' : option.default }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: option.default }}
                        ></div>
                        <span>{option.default}</span>
                        {option.value === option.default && <Check className="w-3 h-3 ml-1 text-primary" />}
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="flex flex-wrap gap-1.5">
                {['#6366F1', '#0EA5E9', '#22C55E', '#EC4899', '#171717', '#FFFFFF'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(option.id, color)}
                    className={cn(
                      "w-6 h-6 rounded-full border transition-all flex items-center justify-center",
                      option.value === color ? "ring-2 ring-primary/30 ring-offset-1" : ""
                    )}
                    style={{ 
                      backgroundColor: color,
                      borderColor: color === '#FFFFFF' ? '#E5E7EB' : 'transparent'
                    }}
                    title={color}
                  >
                    {option.value === color && <Check className="w-3 h-3" style={{ color: getContrastColor(color) }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get a contrasting text color
function getContrastColor(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance using the common formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light ones
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
} 