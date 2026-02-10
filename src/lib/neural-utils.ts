import { formatDistanceToNow } from "date-fns";
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
export function formatNeuralDate(timestamp: number): string {
  const distance = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  // Clean up distance to match T-minus aesthetic
  if (timestamp > Date.now()) {
    return `T-plus ${distance.replace('in ', '')}`;
  }
  return distance.replace('about ', '').replace('less than ', '');
}
export function getServiceColor(serviceName: string): string {
  const colors: Record<string, string> = {
    gmail: "#00d4ff", // bio-cyan
    calendar: "#8b5cf6", // memory-violet
    system: "#f472b6", // alert-pink
    mcp: "#10b981", // Emerald
  };
  return colors[serviceName.toLowerCase()] || "#00d4ff";
}
export function generateSynapseID() {
  return `syn-${Math.random().toString(36).substring(2, 9)}`;
}