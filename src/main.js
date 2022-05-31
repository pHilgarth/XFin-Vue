import { createApp } from 'vue';
import { router } from './router';

import App from './App';

import OrganismBudgetList from './components/organisms/shared/OrganismBudgetList';
import OrganismTable from './components/organisms/shared/OrganismTable';

import MoleculeActionSelect from './components/molecules/MoleculeActionSelect';

const app = createApp(App);

app.component('OrganismBudgetList', OrganismBudgetList);
app.component('OrganismTable', OrganismTable);

app.component('MoleculeActionSelect', MoleculeActionSelect);

app.use(router);
app.mount('#app');
