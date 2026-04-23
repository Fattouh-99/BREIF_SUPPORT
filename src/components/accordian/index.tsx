import React from 'react'
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion as ShadcnAccordion } from '@/components/ui/accordion'
import { MessageSquare } from 'lucide-react'

type Props = {
  trigger: string
  content: string
  themeColor?: string
}

const Accordion = ({ content, trigger, themeColor = '#6366F1' }: Props) => {
  return (
    <ShadcnAccordion
      type="single"
      collapsible
      className="rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200"
    >
      <AccordionItem value="item-1" className="border-none px-4">
        <AccordionTrigger className="hover:no-underline group">
          <div className="flex items-center gap-3">
            <div 
              className="min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center group-data-[state=open]:scale-110 transition-transform" 
              style={{ 
                background: `${themeColor}15`,
                aspectRatio: '1/1'
              }}
            >
              <MessageSquare className="w-4 h-4 transition-colors" style={{ color: themeColor }} />
            </div>
            <span className="text-gray-700 transition-colors" style={{ 
              '--open-color': themeColor 
            } as React.CSSProperties}>
              {trigger}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-gray-600">
          <div className="pl-11">
            {content}
          </div>
        </AccordionContent>
      </AccordionItem>
    </ShadcnAccordion>
  )
}

export default Accordion
