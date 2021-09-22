import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import AccountView from './components/pages/AccountView';
import AccountDetail from './components/pages/AccountDetail';
import RevenueForm from './components/pages/RevenueForm';
import ExpenseForm from './components/pages/ExpenseForm';
import BudgetManager from './components/pages/BudgetManager';
import UpdateAccountHolder from './components/pages/UpdateAccountHolder';
import CreateAccountHolder from './components/pages/CreateAccountHolder';

import OrganismBudgetList from './components/organisms/OrganismBudgetList';
import OrganismTable from './components/organisms/OrganismTable';

import MoleculeActionSelect from './components/molecules/MoleculeActionSelect';
import MoleculeCard from './components/molecules/MoleculeCard';

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

app.component('OrganismBudgetList', OrganismBudgetList);
app.component('OrganismTable', OrganismTable);

app.component('MoleculeActionSelect', MoleculeActionSelect);
app.component('MoleculeCard', MoleculeCard);

app.use(router);
app.mount('#app');
