export type ClientStatus = 'new' | 'active' | 'blocked'

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  status: ClientStatus
  createdAt: string
}

export type ClientFormData = Omit<Client, 'id' | 'createdAt'>
