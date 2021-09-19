import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/account-view/AccountView';
import AccountDetail from './components/account-detail/AccountDetail';
import BudgetManager from './components/budget-manager/BudgetManager';
import UpdateAccountHolder from './components/account-holder/UpdateAccountHolder';
import CreateAccountHolder from './components/account-holder/CreateAccountHolder';
import RevenueForm from './components/revenue-form/RevenueForm';
import ExpenseForm from './components/expense-form/ExpenseForm';
import OrganismTable from './components/organisms/OrganismTable';
import MoleculeActionSelect from './components/molecules/MoleculeActionSelect';

import App from './App';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/accountHolders/0', component: CreateAccountHolder },
        { path: '/accountHolders/:id', component: UpdateAccountHolder },
        { path: '/new-revenue/:id', component: RevenueForm },
        { path: '/new-expense/:id', component: ExpenseForm },
        { path: '/budget-manager', component: BudgetManager },
    ]
});

const app = createApp(App);

app.component('OrganismTable', OrganismTable);
app.component('MoleculeActionSelect', MoleculeActionSelect);

app.use(router);
app.mount('#app');
