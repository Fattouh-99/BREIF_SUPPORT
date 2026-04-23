'use client';

import { useState } from 'react';
import TeamGoalEditForm from './TeamGoalEditForm';
import SaveDefaultsButton from './SaveDefaultsButton';
import { useTheme } from 'next-themes';
import { Target, Users, TicketIcon } from 'lucide-react';

interface TeamGoalData {
  current: number;
  target: number;
}

interface TeamGoalsSectionProps {
  initialGoals: {
    newClients: TeamGoalData;
    interactions: TeamGoalData;
    tickets: TeamGoalData;
  };
}

export default function TeamGoalsSection({ initialGoals }: TeamGoalsSectionProps) {
  // Create state for each goal target
  const [clientsCurrent, setClientsCurrent] = useState(initialGoals.newClients.current);
  const [clientsTarget, setClientsTarget] = useState(initialGoals.newClients.target);
  
  const [interactionsCurrent, setInteractionsCurrent] = useState(initialGoals.interactions.current);
  const [interactionsTarget, setInteractionsTarget] = useState(initialGoals.interactions.target);
  
  const [ticketsCurrent, setTicketsCurrent] = useState(initialGoals.tickets.current);
  const [ticketsTarget, setTicketsTarget] = useState(initialGoals.tickets.target);
  
  const { theme, resolvedTheme } = useTheme();
  const isDarkTheme = theme === 'dark' || resolvedTheme === 'dark';
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Monthly Progress</h3>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isDarkTheme ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-600"
              }`}>
                <Target className="h-4 w-4" />
              </div>
              <span className={`font-medium ${isDarkTheme ? "text-gray-200" : "text-gray-800"}`}>
                New Clients
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-lg font-semibold ${isDarkTheme ? "text-gray-300" : "text-gray-800"}`}>
                {clientsCurrent} / {clientsTarget}
              </div>
              
              {/* Editable goal target with onSuccess callback */}
              <TeamGoalEditForm 
                goalType="clients"
                defaultValue={clientsTarget}
                onSuccess={(newValue) => setClientsTarget(newValue)}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
          <div className={`h-2 ${isDarkTheme ? "bg-indigo-950" : "bg-indigo-100"} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${isDarkTheme ? "bg-indigo-600" : "bg-indigo-500"} rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${Math.min(100, (clientsCurrent / clientsTarget) * 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isDarkTheme ? "bg-blue-900/40 text-blue-400" : "bg-blue-100 text-blue-600"
              }`}>
                <Users className="h-4 w-4" />
              </div>
              <span className={`font-medium ${isDarkTheme ? "text-gray-200" : "text-gray-800"}`}>
                Client Interactions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-lg font-semibold ${isDarkTheme ? "text-gray-300" : "text-gray-800"}`}>
                {interactionsCurrent} / {interactionsTarget}
              </div>
              
              {/* Editable goal target with onSuccess callback */}
              <TeamGoalEditForm 
                goalType="interactions"
                defaultValue={interactionsTarget}
                onSuccess={(newValue) => setInteractionsTarget(newValue)}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
          <div className={`h-2 ${isDarkTheme ? "bg-blue-950" : "bg-blue-100"} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${isDarkTheme ? "bg-blue-600" : "bg-blue-500"} rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${Math.min(100, (interactionsCurrent / interactionsTarget) * 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isDarkTheme ? "bg-purple-900/40 text-purple-400" : "bg-purple-100 text-purple-600"
              }`}>
                <TicketIcon className="h-4 w-4" />
              </div>
              <span className={`font-medium ${isDarkTheme ? "text-gray-200" : "text-gray-800"}`}>
                Support Tickets
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-lg font-semibold ${isDarkTheme ? "text-gray-300" : "text-gray-800"}`}>
                {ticketsCurrent} / {ticketsTarget}
              </div>
              
              {/* Editable goal target with onSuccess callback */}
              <TeamGoalEditForm 
                goalType="tickets"
                defaultValue={ticketsTarget}
                onSuccess={(newValue) => setTicketsTarget(newValue)}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>
          <div className={`h-2 ${isDarkTheme ? "bg-purple-950" : "bg-purple-100"} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${isDarkTheme ? "bg-purple-600" : "bg-purple-500"} rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${Math.min(100, (ticketsCurrent / ticketsTarget) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <SaveDefaultsButton />
      </div>
    </div>
  );
} 