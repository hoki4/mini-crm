import type { Client, ClientFormData } from '@/types/client'

const STORAGE_KEY = 'mini-crm-clients'
const DELAY = 300

function delay(ms = DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateId(): number {
  return Date.now() + Math.round(Math.random() * 1000)
}

const seedData: Client[] = [
  { id: 1, name: 'Иван Петров', email: 'ivan@example.com', phone: '+7 (900) 111-22-33', status: 'active', createdAt: '2025-01-15' },
  { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', phone: '+7 (900) 222-33-44', status: 'new', createdAt: '2025-02-20' },
  { id: 3, name: 'Алексей Козлов', email: 'alexey@example.com', phone: '+7 (900) 333-44-55', status: 'active', createdAt: '2025-03-10' },
  { id: 4, name: 'Елена Новикова', email: 'elena@example.com', phone: '+7 (900) 444-55-66', status: 'blocked', createdAt: '2025-04-05' },
  { id: 5, name: 'Дмитрий Волков', email: 'dmitry@example.com', phone: '+7 (900) 555-66-77', status: 'active', createdAt: '2025-05-12' },
  { id: 6, name: 'Ольга Морозова', email: 'olga@example.com', phone: '+7 (900) 666-77-88', status: 'new', createdAt: '2025-06-18' },
  { id: 7, name: 'Сергей Лебедев', email: 'sergey@example.com', phone: '+7 (900) 777-88-99', status: 'active', createdAt: '2025-07-22' },
  { id: 8, name: 'Наталья Егорова', email: 'natalia@example.com', phone: '+7 (900) 888-99-00', status: 'blocked', createdAt: '2025-08-30' },
  { id: 9, name: 'Андрей Соколов', email: 'andrey@example.com', phone: '+7 (900) 999-00-11', status: 'new', createdAt: '2025-09-14' },
  { id: 10, name: 'Татьяна Попова', email: 'tatiana@example.com', phone: '+7 (900) 100-20-30', status: 'active', createdAt: '2025-10-01' },
  { id: 11, name: 'Виктор Михайлов', email: 'victor@example.com', phone: '+7 (900) 200-30-40', status: 'new', createdAt: '2025-11-08' },
  { id: 12, name: 'Анна Федорова', email: 'anna@example.com', phone: '+7 (900) 300-40-50', status: 'active', createdAt: '2025-12-25' },
]

function getClients(): Client[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
    return seedData
  }
  return JSON.parse(raw) as Client[]
}

function saveClients(clients: Client[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

export const clientApi = {
  async fetchAll(): Promise<Client[]> {
    await delay()
    return getClients()
  },

  async getById(id: number): Promise<Client | undefined> {
    await delay()
    return getClients().find((c) => c.id === id)
  },

  async create(data: ClientFormData): Promise<Client> {
    await delay()
    const clients = getClients()
    const newClient: Client = {
      id: generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    clients.push(newClient)
    saveClients(clients)
    return newClient
  },

  async update(id: number, data: ClientFormData): Promise<Client> {
    await delay()
    const clients = getClients()
    const index = clients.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Клиент не найден')
    const existing = clients[index]!
    const updated: Client = {
      id: existing.id,
      createdAt: existing.createdAt,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
    }
    clients[index] = updated
    saveClients(clients)
    return updated
  },

  async delete(id: number): Promise<void> {
    await delay()
    const clients = getClients()
    const filtered = clients.filter((c) => c.id !== id)
    saveClients(filtered)
  },
}
