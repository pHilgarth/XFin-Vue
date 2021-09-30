import { createApp } from 'vue';
import { router } from './router';

import App from './App';

import OrganismBudgetList from './components/organisms/OrganismBudgetList';
import OrganismTable from './components/organisms/OrganismTable';

import MoleculeActionSelect from './components/molecules/MoleculeActionSelect';
import MoleculeCard from './components/molecules/MoleculeCard';

const app = createApp(App);

app.component('OrganismBudgetList', OrganismBudgetList);
app.component('OrganismTable', OrganismTable);

app.component('MoleculeActionSelect', MoleculeActionSelect);
app.component('MoleculeCard', MoleculeCard);

app.use(router);
app.mount('#app');
