export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
  userId?: string;
};

const contactRequests: ContactRequest[] = [];

export function createContactRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}): ContactRequest {
  const request: ContactRequest = {
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    userId: input.userId,
  };
  contactRequests.unshift(request);
  return request;
}

export function getAllContactRequests(): ContactRequest[] {
  return contactRequests;
}

export function getContactRequest(id: string): ContactRequest | undefined {
  return contactRequests.find(r => r.id === id);
}

export function updateContactRequest(id: string, updates: Partial<ContactRequest>): void {
  const index = contactRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    contactRequests[index] = { ...contactRequests[index], ...updates };
  }
}

export function deleteContactRequest(id: string): void {
  const index = contactRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    contactRequests.splice(index, 1);
  }
}
