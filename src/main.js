import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/account-view/AccountView';
import AccountDetail from './components/account-detail/AccountDetail';

import App from './App.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:accountNumber', component: AccountDetail }
    ]
});

const app = createApp(App);

app.use(router);
app.mount('#app');
