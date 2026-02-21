<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import { clientApi } from '@/api/clientApi'
import type { ClientFormData } from '@/types/client'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const store = useClientStore()
const toast = useToast()

const isEdit = computed(() => route.name === 'client-edit')
const clientId = computed(() => Number(route.params.id))

const form = ref<ClientFormData>({
  name: '',
  email: '',
  phone: '',
  status: 'new',
})

const errors = ref<Partial<Record<keyof ClientFormData, string>>>({})
const submitting = ref(false)
const loadingClient = ref(false)

const statusOptions = [
  { label: 'Новый', value: 'new' },
  { label: 'Активный', value: 'active' },
  { label: 'Заблокирован', value: 'blocked' },
]

function formatPhone(event: Event) {
  const input = event.target as HTMLInputElement
  let digits = input.value.replace(/\D/g, '')

  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.startsWith('7')) digits = digits.slice(0, 11)
  else digits = digits.slice(0, 10)

  let formatted = ''
  if (digits.length > 0) formatted = '+7'
  if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`
  if (digits.length >= 4) formatted += ')'
  if (digits.length > 4) formatted += ` ${digits.slice(4, 7)}`
  if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`
  if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`

  form.value.phone = formatted
}

function validate(): boolean {
  const e: Partial<Record<keyof ClientFormData, string>> = {}

  if (!form.value.name.trim()) {
    e.name = 'Введите имя клиента'
  }

  if (!form.value.email.trim()) {
    e.email = 'Введите email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    e.email = 'Некорректный формат email'
  }

  if (!form.value.phone.trim()) {
    e.phone = 'Введите номер телефона'
  } else if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(form.value.phone)) {
    e.phone = 'Введите полный номер: +7 (XXX) XXX-XX-XX'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

async function onSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await store.updateClient(clientId.value, form.value)
      toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Данные клиента обновлены', life: 3000 })
    } else {
      await store.createClient(form.value)
      toast.add({ severity: 'success', summary: 'Создано', detail: 'Новый клиент добавлен', life: 3000 })
    }
    router.push({ name: 'clients' })
  } catch {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: store.error || 'Что-то пошло не так', life: 5000 })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loadingClient.value = true
    const client = await clientApi.getById(clientId.value)
    if (client) {
      form.value = {
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
      }
    } else {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Клиент не найден', life: 5000 })
      router.push({ name: 'clients' })
    }
    loadingClient.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <Button
        icon="pi pi-arrow-left"
        label="Назад"
        text
        size="small"
        @click="router.push({ name: 'clients' })"
        class="back-btn"
      />
    </div>

    <div class="form-card">
      <div class="form-header">
        <h1 class="form-title">{{ isEdit ? 'Редактирование' : 'Новый клиент' }}</h1>
        <p class="form-subtitle">{{ isEdit ? 'Измените данные клиента' : 'Заполните информацию о клиенте' }}</p>
      </div>

      <div v-if="loadingClient" class="loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: #94a3b8" />
        <span>Загрузка данных...</span>
      </div>

      <form v-else @submit.prevent="onSubmit" class="form">
        <div class="form-grid">
          <div class="field">
            <label for="name">Имя <span class="required">*</span></label>
            <InputText
              id="name"
              v-model="form.name"
              :invalid="!!errors.name"
              placeholder="Иван Петров"
            />
            <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
          </div>

          <div class="field">
            <label for="email">Email <span class="required">*</span></label>
            <InputText
              id="email"
              v-model="form.email"
              :invalid="!!errors.email"
              placeholder="ivan@example.com"
            />
            <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
          </div>

          <div class="field">
            <label for="phone">Телефон <span class="required">*</span></label>
            <InputText
              id="phone"
              :value="form.phone"
              @input="formatPhone"
              :invalid="!!errors.phone"
              placeholder="+7 (900) 123-45-67"
            />
            <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
          </div>

          <div class="field">
            <label for="status">Статус</label>
            <Select
              id="status"
              v-model="form.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>

        <div class="form-footer">
          <Button
            type="button"
            label="Отмена"
            severity="secondary"
            outlined
            @click="router.push({ name: 'clients' })"
          />
          <Button
            type="submit"
            :label="isEdit ? 'Сохранить изменения' : 'Создать клиента'"
            :loading="submitting"
            icon="pi pi-check"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 560px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 0.5rem;
}

.back-btn {
  color: #64748b;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.form-header {
  padding: 1.5rem 1.5rem 0;
}

.form-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.form-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.form {
  padding: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #334155;
}

.required {
  color: #ef4444;
}

.field :deep(input),
.field :deep(.p-select) {
  width: 100%;
}

.field-error {
  color: #ef4444;
  font-size: 0.8rem;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #64748b;
  font-size: 0.875rem;
}
</style>
