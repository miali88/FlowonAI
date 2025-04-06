export interface Client {
  id: number;
  name: string;
  number: string;
  language: string;
  personalDetails: {
    company: string;
    position: string;
  };
  status?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const clients: Client[] = [
  {
    id: 1,
    name: "John Smith",
    number: "+1 (555) 123-4567",
    language: "English",
    personalDetails: {
      company: "Tech Corp",
      position: "CEO"
    },
    status: "Called",
  },
  {
    id: 2,
    name: "Maria Garcia",
    number: "+34 555 678 901",
    language: "Spanish",
    personalDetails: {
      company: "Global Solutions",
      position: "Marketing Director"
    },
    status: "In Progress",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    number: "+81 3-1234-5678",
    language: "Japanese",
    personalDetails: {
      company: "Innovation Ltd",
      position: "Product Manager"
    },
    status: "Pending",
  }
];

export const addClient = (client: Omit<Client, 'id'>) => {
  const newClient = {
    id: clients.length + 1,
    ...client
  };
  clients.push(newClient);
  return newClient;
};

export const updateClientStatus = (id: number, status: string) => {
  const client = clients.find(c => c.id === id);
  if (client) {
    client.status = status;
  }
  return client;
}; 