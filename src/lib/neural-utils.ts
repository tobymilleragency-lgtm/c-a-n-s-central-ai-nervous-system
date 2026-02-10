export function getMockSignals() {
  return {
    emails: [
      {
        subject: "Neural Core Update Available",
        preview: "The latest synaptic pathways have been optimized for better memory...",
        from: "System Architecture"
      },
      {
        subject: "Project Phoenix Milestone",
        preview: "Team has successfully integrated the temporal database with the...",
        from: "Marcus Chen"
      },
      {
        subject: "Sync Request: Knowledge Graph",
        preview: "Requesting access to the decentralized knowledge base for data...",
        from: "External Node 7"
      }
    ],
    events: [
      {
        time: "14:30",
        title: "Brainstorm: AI Reflexes",
        type: "internal"
      },
      {
        time: "16:00",
        title: "Immune System Audit",
        type: "security"
      },
      {
        time: "18:00",
        title: "Memory Flush Protocol",
        type: "maintenance"
      }
    ]
  };
}
export function generateSynapseID() {
  return `syn-${Math.random().toString(36).substr(2, 9)}`;
}