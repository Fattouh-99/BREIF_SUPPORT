import { onGetCurrentDomainInfo } from '@/actions/settings'
import AppointmentTable from '@/components/appointmentsTable'
import BotTrainingForm from '@/components/forms/settings/bot-training'
import SettingsForm from '@/components/forms/settings/form'
import CodeSnippet from '@/components/forms/settings/code-snippet'
import InfoBar from '@/components/infobar'
import ProductTable from '@/components/products'
import React, { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@clerk/nextjs'
import { BotIconType } from '@/icons/bot-icons'
import ChatbotSettings from '@/components/forms/settings/chatbot-settings'
import ChatbotPreviewWidget from '@/components/chatbot/preview-widget'
import Link from 'next/link'
import { Settings, Bot, FileText, Package, MessageSquare, Sparkles, CheckCircle, AlertCircle, Globe, Code, Rocket } from 'lucide-react'
import { UsageAlert } from '@/components/billing/usage-alert'

// Modern Loading components with animated gradients
const SettingsFormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-24 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-12 w-1/2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
  </div>
)

const BotTrainingFormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-32 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="grid grid-cols-2 gap-6">
      <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
      <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
  </div>
)

const ChatbotSettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-24 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-12 w-1/3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
  </div>
)

const OnboardingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
  </div>
)

type Props = { params: { domain: string } }

const DomainSettingsPage = async ({ params }: Props) => {
  const domain = await onGetCurrentDomainInfo(params.domain)
  if (!domain) return (
  <div className="flex flex-col flex-1 mr-5 ml-1">
    <InfoBar />
    <div className="px-6 pt-4">
      <UsageAlert />
    </div>
    <div className="overflow-y-auto w-full flex-1 h-0">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Domain Not Found</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
              We couldn't locate the domain you're looking for. This might be a temporary issue or the domain may no longer exist.
            </p>
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400">
                If you believe this is an error, please contact our support team for assistance.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)
  
  const currentDomain = domain.domains[0]
  
  // Determine user permissions
  const permissions = await (async () => {
    // Default permissions (no access)
    const defaultPermissions = {
      canModifyName: false,
      canModifyIcon: false,
      canModifyChat: false,
      canDelete: false
    };
    
    if (!currentDomain.permissions) {
      console.log('No permissions found for this domain');
      return defaultPermissions;
    }
    
    try {
      // Parse permissions if needed
      let permissionsObj = currentDomain.permissions;
      if (typeof permissionsObj === 'string') {
        permissionsObj = JSON.parse(permissionsObj);
      }
      
      // If this is the domain owner, give full permissions
      if (currentDomain.userId === domain.id) {
        console.log('Setting full permissions for owner');
        return {
          canModifyName: true,
          canModifyIcon: true,
          canModifyChat: true,
          canDelete: true
        };
      }
      
      // For simplicity, let the domain be editable for users who can see it
      return {
        canModifyName: true,
        canModifyIcon: true,
        canModifyChat: true,
        canDelete: currentDomain.userId === domain.id // Only allow deletion for owner
      };
      
    } catch (e) {
      console.error('Error parsing permissions:', e);
      return defaultPermissions;
    }
  })();
  
  return (
    <div className="flex flex-col flex-1 mr-5 ml-1">
      <InfoBar />
      <div className="px-6 pt-4">
        <UsageAlert />
      </div>
      <div className="overflow-y-auto w-full flex-1 h-0 rounded-xl">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Domain Settings
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Configure your chatbot and domain preferences
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="settings" className="space-y-8">
              {/* Modern Tab Navigation */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-xl">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-transparent gap-2 mb-3">
                  <TabsTrigger 
                    value="settings"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-3 font-medium transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  {permissions.canModifyChat && (
                    <TabsTrigger 
                      value="bot-training"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-3 font-medium transition-all duration-200"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="hidden sm:inline">Training</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="onboarding"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-3 font-medium transition-all duration-200"
                  >
                    <Rocket className="w-4 h-4" />
                    <span className="hidden sm:inline">Setup</span>
                  </TabsTrigger>
                                     {('chatBot' in currentDomain && (currentDomain as any).chatBot && (currentDomain as any).chatBot.productsEnabled) && (
                    <TabsTrigger 
                      value="products"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-3 font-medium transition-all duration-200"
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Products</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="chatbot-settings"
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-3 font-medium transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chatbot</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content with Modern Cards */}
              <TabsContent value="settings" className="space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">General Settings</h2>
                      <p className="text-slate-600 dark:text-slate-400">Configure your domain and chatbot basic settings</p>
                    </div>
                  </div>
                                     <Suspense fallback={<SettingsFormSkeleton />}>
                     <SettingsForm
                       plan={domain.subscription?.plan as 'PRO'}
                       chatBot={(currentDomain as any).chatBot ? {
                         ...(currentDomain as any).chatBot,
                         customLinks: (currentDomain as any).chatBot.customLinks?.map((link: any) => ({
                           id: link.id,
                           title: link.title,
                           description: link.description,
                           url: link.url,
                           createdAt: link.createdAt.toISOString()
                         })) || []
                       } : null}
                       id={currentDomain.id}
                       name={currentDomain.name}
                       permissions={permissions}
                       domainIcon={currentDomain.icon}
                       helpDeskQuestions={('helpdesk' in currentDomain) ? (currentDomain as any).helpdesk : []}
                     />
                   </Suspense>
                </div>
              </TabsContent>

              {permissions.canModifyChat && (
                <TabsContent value="bot-training" className="space-y-6">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bot Training</h2>
                        <p className="text-slate-600 dark:text-slate-400">Train your chatbot with custom data and responses</p>
                      </div>
                    </div>
                    <Suspense fallback={<BotTrainingFormSkeleton />}>
                      <BotTrainingForm id={currentDomain.id} />
                    </Suspense>
                  </div>
                </TabsContent>
              )}
            
              <TabsContent value="onboarding" className="space-y-6">
                <Suspense fallback={<OnboardingSkeleton />}>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Rocket className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Chatbot Integration Guide</h2>
                          <p className="text-orange-100 text-lg mt-2">
                            Follow this step-by-step guide to integrate your AI chatbot with your website or application.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {/* Integration Steps */}
                      <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                              1
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Choose Your Integration Method</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                              Select the appropriate code snippet based on your website's technology:
                            </p>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <Code className="w-5 h-5 text-blue-600" />
                                  <span className="font-semibold text-blue-800 dark:text-blue-300">Vanilla JavaScript</span>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-400">For standard HTML websites</p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <Code className="w-5 h-5 text-green-600" />
                                  <span className="font-semibold text-green-800 dark:text-green-300">React</span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-400">For React.js applications</p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <Code className="w-5 h-5 text-purple-600" />
                                  <span className="font-semibold text-purple-800 dark:text-purple-300">Vue</span>
                                </div>
                                <p className="text-sm text-purple-700 dark:text-purple-400">For Vue.js applications</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                              2
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Copy and Customize the Code</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                              The code snippet below is pre-configured with your unique bot ID: 
                              <span className="mx-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-sm text-slate-800 dark:text-slate-200 border">
                                {currentDomain.id}
                              </span>
                            </p>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-400 rounded-r-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                <span className="font-semibold text-amber-800 dark:text-amber-300">Pro Tip</span>
                              </div>
                              <p className="text-amber-700 dark:text-amber-400 text-sm">
                                The provided code automatically handles responsive design, positioning, and communication with your chatbot.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                              3
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Add the Code to Your Website</h3>
                            <div className="space-y-4">
                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">For Vanilla JavaScript:</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  Add the code inside a <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs">&lt;script&gt;</code> tag at the end of your HTML file, just before the closing <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs">&lt;/body&gt;</code> tag.
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">For React:</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  Create a new component file (e.g., <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs">ChatbotEmbed.jsx</code>) with the provided code, then import and use this component in your main layout or app component.
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">For Vue:</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  Create a new <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-xs">.vue</code> file with the provided code, import it in your main App component, and add it to your template.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step 4 */}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                              4
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Test Your Integration</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">After adding the code:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-green-800 dark:text-green-300">Visit your website to ensure the chatbot appears correctly</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-green-800 dark:text-green-300">Verify that clicking the chatbot icon opens the chat interface</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-green-800 dark:text-green-300">Test the chatbot with a few questions to ensure it responds properly</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-green-800 dark:text-green-300">Check the mobile view to confirm responsive behavior</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step 5 */}
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                              5
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Customize Appearance (Optional)</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                              You can customize the appearance of your chatbot in the <span className="font-semibold text-blue-600 dark:text-blue-400">General Settings</span> tab, including:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">Chat icon style and color</span>
                              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">Chat window theme and colors</span>
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">Welcome messages and bot behavior</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Code Snippet Section */}
                      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                            <Code className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Integration Code</h3>
                        </div>
                        <CodeSnippet id={currentDomain.id} />
                      </div>
                      
                      {/* Troubleshooting Section */}
                      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Troubleshooting</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Chatbot Not Appearing?</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                Ensure you've added the code to the correct location in your website files
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                Check browser console for any JavaScript errors
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                Verify that your website's Content Security Policy (CSP) allows iframe loading
                              </li>
                            </ul>
                          </div>
                          <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Styling Issues?</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                Ensure your website's CSS is not conflicting with the chatbot styles
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                Try increasing the z-index value in the code if the chatbot is appearing behind other elements
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Suspense>
              </TabsContent>
              
              {('chatBot' in currentDomain && currentDomain.chatBot && (currentDomain.chatBot as any).productsEnabled) && (
                <TabsContent value="products" className="space-y-6">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Products</h2>
                        <p className="text-slate-600 dark:text-slate-400">Manage your chatbot's product catalog</p>
                      </div>
                    </div>
                    <Suspense fallback={<TableSkeleton />}>
                      <ProductTable
                        id={currentDomain.id}
                        products={('products' in currentDomain) ? (currentDomain as any).products?.map((product: any) => ({
                          ...product,
                          createdAt: product.createdAt.toISOString(),
                          updatedAt: product.updatedAt.toISOString()
                        })) || [] : []}
                      />
                    </Suspense>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="chatbot-settings" className="space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chatbot Settings</h2>
                      <p className="text-slate-600 dark:text-slate-400">Configure chatbot behavior and appearance</p>
                    </div>
                  </div>
                                     <Suspense fallback={<ChatbotSettingsSkeleton />}>
                     <ChatbotSettings
                       id={currentDomain.id}
                       chatBot={(currentDomain as any).chatBot}
                     />
                   </Suspense>
                </div>
              </TabsContent>
            </Tabs> 
          </div>
        </div>
      </div>

      {/* Chatbot Preview Widget */}
      <ChatbotPreviewWidget
        domainName={currentDomain.name}
        chatBot={(currentDomain as any).chatBot}
        products={('products' in currentDomain) ? (currentDomain as any).products?.map((product: any) => ({
          ...product,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString()
        })) || [] : []}
        helpdesk={('helpdesk' in currentDomain) ? (currentDomain as any).helpdesk : []}
        customLinks={(currentDomain as any).chatBot?.customLinks?.map((link: any) => ({
          id: link.id,
          title: link.title,
          description: link.description,
          url: link.url,
          createdAt: link.createdAt.toISOString()
        })) || []}
        domainIcon={currentDomain.icon}
        domainId={currentDomain.id}
      />
    </div>
  )
}

export default DomainSettingsPage
