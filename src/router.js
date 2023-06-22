import { createRouter, createWebHistory } from 'vue-router';

import AccountDetail from './components/pages/AccountDetail';
import AccountHolders from './components/pages/AccountHolders';
import AccountView from './components/pages/AccountView';
import BudgetManager from './components/pages/BudgetManager';
import Dashboard from './components/pages/Dashboard';
import DebtManager from './components/pages/DebtManager';
import EditAccountHolder from './components/pages/EditAccountHolder';
import NewAccountHolder from './components/pages/NewAccountHolder';
//import NewExpense from './components/pages/NewExpense';
import NewLoan from './components/pages/NewLoan';
import NewOverheads from './components/pages/NewOverheads';
import NewReserve from './components/pages/NewReserve';
//import NewRevenue from './components/pages/NewRevenue';
import Overheads from './components/pages/Overheads';
import RecurringRevenues from './components/pages/RecurringRevenues';
import RecurringTransaction from "./components/pages/RecurringTransaction";
import ReserveManager from './components/pages/ReserveManager';
import TransactionManager from './components/pages/TransactionManager';

import DesignElements from './components/pages/DesignElements';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Dashboard },
        { path: '/accounts', component: AccountView },
        { path: '/accounts/:id', component: AccountDetail },
        { path: '/account-holders', component: AccountHolders },
        { path: '/budget-manager', component: BudgetManager },
        { path: '/debt-manager', component: DebtManager },
        { path: '/edit-account-holder', name: 'edit-account-holder', component: EditAccountHolder, props: true },
        { path: '/new-account-holder', component: NewAccountHolder },
        { path: '/new-loan', component: NewLoan },
        { path: '/new-overheads', component: NewOverheads},
        { path: '/new-reserve/', component: NewReserve },
        { path: '/overheads', name: 'overheads', component: Overheads},
        { path: '/recurring-revenues', component: RecurringRevenues },
        { path: '/recurring-transaction', name: 'recurring-transaction', component: RecurringTransaction },
        { path: '/reserves', component: ReserveManager },
        { path: '/transaction', name: 'transaction-manager', component: TransactionManager, props: true },

        { path: '/design-elements', component: DesignElements },
    ],
});