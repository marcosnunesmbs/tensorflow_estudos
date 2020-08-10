<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Estudos Tensorflow.js
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-item clickable v-ripple class="q-py-md" :to="'/'">
            <q-item-section avatar>
              <q-icon color="orange" name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label><span>Home</span></q-item-label>
              <q-item-label caption>Home page</q-item-label>
            </q-item-section>
          </q-item>
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Projetos
        </q-item-label>
        <div v-for="link in essentialLinks" :key="link.title">
          <q-item clickable v-ripple class="q-py-md" :to="link.link">
            <q-item-section avatar>
              <q-icon color="orange" :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label><span>{{link.title}}</span></q-item-label>
              <q-item-label caption>{{link.caption}}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

const linksData = [
  {
    title: 'Dólar',
    caption: 'Predicate Dollar price',
    icon: 'attach_money',
    link: '/dollar'
  },
  {
    title: 'Bitcoin',
    caption: 'Predicate Bitcoin price',
    icon: 'trending_up',
    link: '/bitcoin'
  },
  {
    title: 'Properties',
    caption: 'Predicate Properties price',
    icon: 'home_work',
    link: '/imoveis'
  }
]

export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData
    }
  }
}
</script>
