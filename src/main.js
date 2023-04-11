import { createApp } from 'vue';
import { router } from './router';
import VueCookies from 'vue-cookies';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import App from './App';

import OrganismBudgetList from './components/organisms/OrganismBudgetList';
import OrganismTable from './components/organisms/OrganismTable';

import MoleculeActionSelect from './components/molecules/MoleculeActionSelect';

const app = createApp(App);

app.component('OrganismBudgetList', OrganismBudgetList);
app.component('OrganismTable', OrganismTable);

app.component('MoleculeActionSelect', MoleculeActionSelect);

app.use(router);
app.use(VueCookies);
app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 3,
    newestOnTop: true
});
app.mount('#app');
