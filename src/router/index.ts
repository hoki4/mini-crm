import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/clients',
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientList.vue'),
    },
    {
      path: '/clients/new',
      name: 'client-create',
      component: () => import('@/views/ClientForm.vue'),
    },
    {
      path: '/clients/:id/edit',
      name: 'client-edit',
      component: () => import('@/views/ClientForm.vue'),
    },
  ],
})

export default router
