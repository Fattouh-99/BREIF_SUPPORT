import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import ChatbotColorSettings from './color-settings';
import ThemePreview from './theme-preview';
import { Paintbrush, Save, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { THEME_CATEGORIES, getAllPresets, getPresetsByCategory } from './theme-helpers';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface ThemeCustomizationProps {
  initialColors: {
    themeColor: string | null;
    textColor: string | null;
    titleColor: string | null;
    helpDeskColor: string | null;
    background: string | null;
    iconColor: string | null;
    bubbleBackground: string | null;
  };
  onSave: (colors: {
    themeColor: string | null;
    textColor: string | null;
    titleColor: string | null;
    helpDeskColor: string | null;
    background: string | null;
    iconColor: string | null;
    bubbleBackground: string | null;
  }) => Promise<void>;
}

export default function ThemeCustomization({ 
  initialColors, 
  onSave
}: ThemeCustomizationProps) {
  const [colors, setColors] = useState({
    themeColor: initialColors.themeColor || '#6366F1',
    textColor: initialColors.textColor || '#4B5563',
    titleColor: initialColors.titleColor || '#1F2937',
    helpDeskColor: initialColors.helpDeskColor || '#F3F4F6',
    background: initialColors.background || '#FFFFFF',
    iconColor: initialColors.iconColor || '#6366F1',
    bubbleBackground: initialColors.bubbleBackground || '#F9FAFB'
  });
  
  const [saving, setSaving] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  // Get all the presets, organized by category
  const presets = getAllPresets();
  const categories = Object.entries(THEME_CATEGORIES);

  const handleColorChange = (colorId: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorId]: value
    }));
    setSelectedPresetId(null); // Clear preset selection when manually changing colors
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setColors({
        themeColor: preset.colors.themeColor,
        textColor: preset.colors.textColor,
        titleColor: preset.colors.titleColor,
        helpDeskColor: preset.colors.helpDeskColor,
        background: preset.colors.background,
        iconColor: preset.colors.iconColor,
        bubbleBackground: preset.colors.bubbleBackground || '#F9FAFB'
      });
      setSelectedPresetId(presetId);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(colors);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5" />
            Theme Customization
          </CardTitle>
          <CardDescription>
            Customize your chatbot's appearance with colors that match your brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="presets">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="presets" className="flex-1 text-sm">Presets</TabsTrigger>
              <TabsTrigger value="colors" className="flex-1 text-sm">Custom Colors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  {categories.map(([categoryKey, categoryName]) => {
                    const categoryPresets = getPresetsByCategory(categoryKey);
                    if (categoryPresets.length === 0) return null;
                    
                    return (
                      <div key={categoryKey} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium">{categoryName}</h3>
                          <Badge variant="outline" className="font-normal">
                            {categoryPresets.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => handlePresetSelect(preset.id)}
                              className={`flex flex-col h-full text-left p-3 rounded-md border transition-all ${
                                selectedPresetId === preset.id
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-primary/50 hover:bg-background'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm truncate max-w-[85%]">{preset.name}</h4>
                                {selectedPresetId === preset.id && (
                                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2rem]">
                                {preset.description}
                              </p>
                              
                              <div className="grid grid-cols-6 gap-1.5">
                                <div 
                                  className="w-full h-6 rounded col-span-2" 
                                  style={{ background: preset.colors.themeColor }}
                                  title="Primary accent color"
                                />
                                <div 
                                  className="w-full h-6 rounded overflow-hidden flex items-center justify-center" 
                                  style={{ background: preset.colors.titleColor, color: preset.colors.background }}
                                  title="Title color"
                                >
                                  <div className="text-[8px] font-bold">Aa</div>
                                </div>
                                <div 
                                  className="w-full h-6 rounded" 
                                  style={{ background: preset.colors.background }}
                                  title="Background color"
                                />
                                <div 
                                  className="w-full h-6 rounded" 
                                  style={{ background: preset.colors.helpDeskColor }}
                                  title="Help desk color"
                                />
                                <div 
                                  className="w-full h-6 rounded" 
                                  style={{ background: preset.colors.iconColor }}
                                  title="Icon color"
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    );
                  })}
                </div>
                
                <div className="md:col-span-2">
                  <div className="sticky top-4">
                    <h3 className="text-base font-medium mb-3">Preview</h3>
                    <ThemePreview {...colors} />
                    
                    <div className="mt-4">
                      <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Apply Theme'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                  <h3 className="text-base font-medium mb-4">Color Settings</h3>
                  <ChatbotColorSettings 
                    colors={colors} 
                    onChange={handleColorChange} 
                  />
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
                    <p className="font-semibold">About Bubble Background Color:</p>
                    <p className="mt-1">This is a preview feature. The color will apply in the preview, but a database schema update is needed to persist this setting across sessions.</p>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <h3 className="text-base font-medium mb-4">Preview</h3>
                  <ThemePreview {...colors} />
                  
                  <div className="mt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Custom Theme'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 