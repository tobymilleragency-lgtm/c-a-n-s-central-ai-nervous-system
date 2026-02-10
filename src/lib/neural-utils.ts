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
  if (timestamp > Date.now()) {
    return `T-plus ${distance.replace('in ', '')}`;
  }
  return distance.replace('about ', '').replace('less than ', '');
}
export function getServiceColor(serviceName: string): string {
  const colors: Record<string, string> = {
    gmail: "#00d4ff",
    calendar: "#8b5cf6",
    system: "#10b981",
    mcp: "#10b981",
  };
  return colors[serviceName.toLowerCase()] || "#00d4ff";
}
export function generateSynapseID() {
  return `syn-${Math.random().toString(36).substring(2, 9)}`;
}
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
export function getConnections(nodes: Array<{x: number, y: number, id: number}>, threshold: number): [number, number][] {
  const connections: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = calculateDistance(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
      if (dist < threshold) {
        connections.push([i, j]);
      }
    }
  }
  return connections;
}