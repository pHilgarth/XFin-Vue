import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/account-view/AccountView';
import AccountDetail from './components/account-detail/AccountDetail';
import UpdateAccountHolder from './components/account-holder/UpdateAccountHolder';
import CreateAccountHolder from './components/account-holder/CreateAccountHolder';

import App from './App';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/accountHolders/0', component: CreateAccountHolder },
        { path: '/accountHolders/:id', component: UpdateAccountHolder },
    ]
});

const app = createApp(App);

app.use(router);
app.mount('#app');
