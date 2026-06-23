'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getChatbotEmbedScript,
  getReactChatbotEmbedComponent,
} from '@/lib/chatbot-embed-snippet'
import { getChatbotBaseUrl, isLocalChatbotUrl } from '@/lib/chatbot-base-url'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const baseUrl = getChatbotBaseUrl()
  const isDevEmbed = isLocalChatbotUrl(baseUrl)

  const vanillaSnippet = getChatbotEmbedScript(id, baseUrl)
  const reactSnippet = getReactChatbotEmbedComponent(id, baseUrl)

  const vueSnippet = `
<!-- ChatbotEmbed.vue -->
<template>
  <!-- This component doesn't render anything visible -->
</template>

<script>
export default {
  name: 'ChatbotEmbed',
  mounted() {
    ${getChatbotEmbedScript(id, baseUrl)}
  },
}
</script>

<!-- Usage example:
<template>
  <div>
    <h1>Your Website</h1>
    <ChatbotEmbed />
  </div>
</template>

<script>
import ChatbotEmbed from './ChatbotEmbed.vue'

export default {
  components: {
    ChatbotEmbed
  }
}
</script>
-->
  `

  return (
    <div className="mt-5 flex flex-col gap-3 items-start w-full">
      <Section
        label="Code snippet"
        message={
          isDevEmbed
            ? `Development mode: snippets point to ${baseUrl}. Start the app with npm run dev before testing embeds.`
            : 'Copy and paste this code snippet into your website'
        }
      />
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1">
          <TabsTrigger value="vanilla" className="flex-1 text-xs sm:text-sm">Vanilla JS</TabsTrigger>
          <TabsTrigger value="react" className="flex-1 text-xs sm:text-sm">React (JSX)</TabsTrigger>
          <TabsTrigger value="vue" className="flex-1 text-xs sm:text-sm">Vue</TabsTrigger>
        </TabsList>

        <TabsContent value="vanilla">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(vanillaSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your website',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{vanillaSnippet}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="react">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(reactSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your React application',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{reactSnippet}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="vue">
          <div className="bg-cream px-2 sm:px-4 py-3 rounded-lg w-full relative overflow-x-auto">
            <Copy
              className="absolute top-2 right-2 text-gray-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
              onClick={() => {
                navigator.clipboard.writeText(vueSnippet)
                toast({
                  title: 'Copied to clipboard',
                  description: 'You can now paste the code inside your Vue application',
                })
              }}
            />
            <pre>
              <code className="text-gray-500 text-xs sm:text-sm whitespace-pre-wrap">{vueSnippet}</code>
            </pre>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default CodeSnippet
