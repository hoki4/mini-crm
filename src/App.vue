<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <RouterLink to="/clients" class="logo">
          <i class="pi pi-users" />
          <span>Mini-CRM</span>
        </RouterLink>
        <nav class="nav">
          <RouterLink
            to="/clients"
            class="nav-link"
            :class="{ active: route.path === '/clients' }"
          >
            Клиенты
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <Toast />
      <ConfirmDialog />
      <RouterView />
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f4f6f9;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
  color: inherit;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: #3b82f6;
}

.logo i {
  font-size: 1.25rem;
}

.nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.15s;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-link.active {
  background: #eff6ff;
  color: #3b82f6;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
