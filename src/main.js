import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/account-view/AccountView';

import App from './App.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
    ]
})

const app = createApp(App)

app.use(router);
app.mount('#app');
