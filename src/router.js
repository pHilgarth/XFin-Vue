import { createRouter, createWebHistory } from 'vue-router';

import AccountDetail from './components/pages/AccountDetail';
import AccountView from './components/pages/AccountView';
import CostCenterManager from './components/pages/CostCenterManager';
import BudgetManager from './components/pages/BudgetManager';
import NewExpense from './components/pages/NewExpense';
import NewAccountHolder from './components/pages/NewAccountHolder';
import NewReserve from './components/pages/NewReserve';
import NewRevenue from './components/pages/NewRevenue';
import EditAccountHolder from './components/pages/EditAccountHolder';
import ReserveManager from './components/pages/ReserveManager';
import ExampleComponent from './components/tempComponents/ExampleComponent';

import DesignElements from './components/pages/DesignElements';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/new-account-holder', component: NewAccountHolder },
        { path: '/edit-account-holder', name: 'edit-account-holder', component: EditAccountHolder, props: true },
        { path: '/new-reserve/', component: NewReserve },
        { path: '/new-revenue/:id', component: NewRevenue },
        { path: '/new-expense', name: 'new-expense', component: NewExpense, props: true },
        { path: '/budget-manager', component: BudgetManager },
        { path: '/design-elements', component: DesignElements},
        { path: '/cost-centers', component: CostCenterManager},
        { path: '/reserves', component: ReserveManager},
        { path: '/example', component: ExampleComponent},
    ],
});