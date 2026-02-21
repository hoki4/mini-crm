import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Client, ClientFormData } from '@/types/client'
import { clientApi } from '@/api/clientApi'

export const useClientStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchClients() {
    loading.value = true
    error.value = null
    try {
      clients.value = await clientApi.fetchAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки клиентов'
    } finally {
      loading.value = false
    }
  }

  async function createClient(data: ClientFormData) {
    error.value = null
    try {
      const created = await clientApi.create(data)
      clients.value.push(created)
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания клиента'
      throw e
    }
  }

  async function updateClient(id: number, data: ClientFormData) {
    error.value = null
    try {
      const updated = await clientApi.update(id, data)
      const index = clients.value.findIndex((c) => c.id === id)
      if (index !== -1) clients.value[index] = updated
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка обновления клиента'
      throw e
    }
  }

  async function deleteClient(id: number) {
    error.value = null
    try {
      await clientApi.delete(id)
      clients.value = clients.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления клиента'
      throw e
    }
  }

  return { clients, loading, error, fetchClients, createClient, updateClient, deleteClient }
})
