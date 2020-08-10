
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'dollar', component: () => import('pages/dollar.vue') },
      { path: 'bitcoin', component: () => import('pages/bitcoin.vue') },
      { path: 'imoveis', component: () => import('pages/imoveis.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
