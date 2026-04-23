'use client';

import { useState } from 'react';
import GoalForm from './GoalForm';
import SaveDefaultsButton from './SaveDefaultsButton';

interface TeamMetrics {
  clients: {
    monthly: number;
  };
  chats: {
    monthly: number;
  };
  tickets: {
    pending: number;
  };
}

interface TeamGoals {
  newClients: {
    current: number;
    target: number;
  };
  interactions: {
    current: number;
    target: number;
  };
  tickets: {
    current: number;
    target: number;
  };
}

interface TeamGoalsManagementProps {
  metrics: TeamMetrics;
  initialGoals: TeamGoals;
}

export default function TeamGoalsManagement({ metrics, initialGoals }: TeamGoalsManagementProps) {
  // Create state for each goal target
  const [clientsTarget, setClientsTarget] = useState(initialGoals.newClients.target);
  const [interactionsTarget, setInteractionsTarget] = useState(initialGoals.interactions.target);
  const [ticketsTarget, setTicketsTarget] = useState(initialGoals.tickets.target);
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md shadow-indigo-900/20 p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl text-indigo-300">Team Goals Management</h3>
        <div className="text-sm text-gray-400">
          Set goals for your team to achieve
        </div>
      </div>
      
      <div className="space-y-7">
        <GoalForm 
          goalType="clients" 
          currentValue={metrics.clients.monthly} 
          targetValue={clientsTarget}
          label="New Clients Goal"
          onSuccess={(newValue) => setClientsTarget(newValue)}
        />
        
        <GoalForm 
          goalType="interactions" 
          currentValue={metrics.chats.monthly} 
          targetValue={interactionsTarget}
          label="Client Interactions Goal"
          onSuccess={(newValue) => setInteractionsTarget(newValue)}
        />
        
        <GoalForm 
          goalType="tickets" 
          currentValue={metrics.tickets.pending} 
          targetValue={ticketsTarget}
          label="Support Tickets Goal"
          onSuccess={(newValue) => setTicketsTarget(newValue)}
        />
      </div>
      
      {/* Save current goals as defaults */}
      <div className="mt-4 flex justify-end">
        <SaveDefaultsButton />
      </div>
    </div>
  );
} 