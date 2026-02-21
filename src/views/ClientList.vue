<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import { useDebounce } from '@/composables/useDebounce'
import type { ClientStatus } from '@/types/client'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const route = useRoute()
const store = useClientStore()
const toast = useToast()
const confirm = useConfirm()

const search = ref((route.query.search as string) || '')
const statusFilter = ref<ClientStatus | ''>((route.query.status as ClientStatus | '') || '')
const debouncedSearch = useDebounce(search, 300)

const statusOptions = [
  { label: 'Все статусы', value: '' },
  { label: 'Новый', value: 'new' },
  { label: 'Активный', value: 'active' },
  { label: 'Заблокирован', value: 'blocked' },
]

const statusLabels: Record<ClientStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  blocked: 'Заблокирован',
}

const statusSeverity: Record<ClientStatus, 'info' | 'success' | 'danger'> = {
  new: 'info',
  active: 'success',
  blocked: 'danger',
}

const filteredClients = computed(() => {
  let result = store.clients
  const q = debouncedSearch.value.toLowerCase().trim()
  if (q) {
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    )
  }
  if (statusFilter.value) {
    result = result.filter((c) => c.status === statusFilter.value)
  }
  return result
})

watch([debouncedSearch, statusFilter], ([s, st]) => {
  const query: Record<string, string> = {}
  if (s) query.search = s
  if (st) query.status = st
  router.replace({ query })
})

function confirmDelete(id: number, name: string) {
  confirm.require({
    message: `Вы уверены, что хотите удалить клиента «${name}»? Это действие нельзя отменить.`,
    header: 'Удаление клиента',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await store.deleteClient(id)
      toast.add({ severity: 'success', summary: 'Готово', detail: `Клиент «${name}» удалён`, life: 3000 })
    },
  })
}

onMounted(() => {
  store.fetchClients()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Клиенты</h1>
        <p class="page-subtitle">Управление базой клиентов</p>
      </div>
      <Button
        label="Добавить клиента"
        icon="pi pi-plus"
        @click="router.push({ name: 'client-create' })"
      />
    </div>

    <div class="card">
      <div class="toolbar">
        <span class="p-input-icon-left search-wrapper">
          <i class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Поиск по имени или email..."
            class="search-input"
          />
        </span>
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="status-select"
        />
      </div>

      <DataTable
        :value="filteredClients"
        :loading="store.loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        sortField="createdAt"
        :sortOrder="-1"
        removableSort
        dataKey="id"
        :pt="{
          table: { style: 'min-width: 50rem' },
        }"
      >
        <template #empty>
          <div class="empty">
            <i class="pi pi-inbox empty-icon" />
            <p class="empty-title">Нет клиентов</p>
            <p class="empty-text">
              {{ search || statusFilter ? 'Попробуйте изменить параметры поиска' : 'Добавьте первого клиента' }}
            </p>
          </div>
        </template>

        <Column field="name" header="Имя" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <div class="client-name">
              <div class="avatar">{{ data.name.charAt(0) }}</div>
              <span>{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" sortable style="min-width: 14rem" />
        <Column field="phone" header="Телефон" style="min-width: 10rem" />
        <Column field="status" header="Статус" sortable style="min-width: 8rem">
          <template #body="{ data }">
            <Tag
              :value="statusLabels[data.status as ClientStatus]"
              :severity="statusSeverity[data.status as ClientStatus]"
            />
          </template>
        </Column>
        <Column field="createdAt" header="Создан" sortable style="min-width: 8rem" />
        <Column header="" style="width: 6rem" :exportable="false">
          <template #body="{ data }">
            <div class="row-actions">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click="router.push({ name: 'client-edit', params: { id: data.id } })"
                v-tooltip.top="'Редактировать'"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                @click="confirmDelete(data.id, data.name)"
                v-tooltip.top="'Удалить'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <p v-if="store.error" class="error-banner">{{ store.error }}</p>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-wrapper i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding-left: 2.25rem !important;
}

.status-select {
  min-width: 170px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
}

.empty-title {
  margin: 0;
  font-weight: 600;
  color: #334155;
}

.empty-text {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

.client-name {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.row-actions {
  display: flex;
  gap: 0.125rem;
  justify-content: flex-end;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  margin: 0;
}
</style>
