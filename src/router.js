import { createRouter, createWebHistory } from 'vue-router';

import AccountDetail from './components/pages/AccountDetail';
import AccountView from './components/pages/AccountView';
import BudgetManager from './components/pages/BudgetManager';
import CostCenterManager from './components/pages/CostCenterManager';
import Dashboard from './components/pages/Dashboard';
import DebtManager from './components/pages/DebtManager';
import EditAccountHolder from './components/pages/EditAccountHolder';
import NewAccountHolder from './components/pages/NewAccountHolder';
//import NewExpense from './components/pages/NewExpense';
import NewLoan from './components/pages/NewLoan';
import NewReserve from './components/pages/NewReserve';
//import NewRevenue from './components/pages/NewRevenue';
import OverheadsManager from './components/pages/OverheadsManager';
import RecurringRevenues from './components/pages/RecurringRevenues';
import ReserveManager from './components/pages/ReserveManager';
import TransactionManager from './components/pages/TransactionManager';

import DesignElements from './components/pages/DesignElements';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Dashboard },
        { path: '/accounts', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/budget-manager', component: BudgetManager },
        { path: '/cost-centers', component: CostCenterManager },
        { path: '/debt-manager', component: DebtManager },
        { path: '/edit-account-holder', name: 'edit-account-holder', component: EditAccountHolder, props: true },
        { path: '/new-account-holder', component: NewAccountHolder },
        //{ path: '/new-expense', name: 'new-expense', component: NewExpense, props: true },
        { path: '/new-loan', component: NewLoan },
        { path: '/new-reserve/', component: NewReserve },
        //{ path: '/new-revenue/:id', component: NewRevenue },
        { path: '/overheads-manager', name: 'overheads-manager', component: OverheadsManager},
        { path: '/recurring-revenues', component: RecurringRevenues },
        { path: '/reserves', component: ReserveManager },
        { path: '/transaction', name: 'transaction-manager', component: TransactionManager, props: true },

        { path: '/design-elements', component: DesignElements },
    ],
});