import { createRouter, createWebHistory } from 'vue-router';

import AccountDetail from './components/pages/AccountDetail';
//TODO - remove this
//import AccountHolder from './components/pages/AccountHolder'
import AccountSettings from './components/pages/AccountSettings';
import AccountView from './components/pages/AccountView';
import BudgetManager from './components/pages/BudgetManager';
import NewExpense from './components/pages/NewExpense';
import NewAccountHolder from './components/pages/NewAccountHolder';
import NewRevenue from './components/pages/NewRevenue';
import UpdateAccountHolder from './components/pages/UpdateAccountHolder';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/new-account-holder', component: NewAccountHolder },
        { path: '/edit-account-holder/:id', component: UpdateAccountHolder },
        { path: '/new-revenue/:id', component: NewRevenue },
        { path: '/new-expense/:id', component: NewExpense },
        { path: '/budget-manager', component: BudgetManager },
        { path: '/account-settings/:id', component: AccountSettings },
    ],
});