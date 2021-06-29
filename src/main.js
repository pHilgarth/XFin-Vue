import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/account-view/AccountView';
import AccountDetail from './components/account-detail/AccountDetail';
import EditAccountHolder from './components/edit-account-holder/EditAccountHolder';

import App from './App';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:accountNumber', component: AccountDetail },
        { path: '/accountHolders/:id?', component: EditAccountHolder }
    ]
});

const app = createApp(App);

app.use(router);
app.mount('#app');
