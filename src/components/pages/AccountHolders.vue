<template>
  <div class="account-holders">
    <AtomHeadline tag="h1" text="Kontoinhaber" />

    <div class="account-holders__item" v-for="accountHolder in accountHolders" :key="accountHolder.id">
      <div class="account-holders__name">
        <span>{{accountHolder.name}}</span>
      </div>
      <div class="account-holders__info">
        <span>
          <strong>Konten: </strong>
          <span :class="getAccountsTotal(accountHolder) >= 0 ? 'positive' : 'negative'">
            <strong>{{ formatCurrency(getAccountsTotal(accountHolder)) }}</strong>
          </span>
        </span>
        <span>
          <strong>Bargeld: </strong>
          <span :class="getAccountsTotal(accountHolder) >= 0 ? 'positive' : 'negative'">
            <strong>{{ formatCurrency(getCashTotal(accountHolder)) }}</strong>
          </span>
        </span>
      </div>
      <AtomEditIcon color="#000000" align="right" @click="$router.push({ name: 'edit-account-holder', params: {accountHolderId: accountHolder.id }})"/>
    </div>

    <AtomButton type="light" text="Kontoinhaber hinzufügen" @click.prevent="$router.push('/new-account-holder')" />
  </div>
</template>

<script>
  import AtomButton from "@/components/atoms/AtomButton";
  import AtomEditIcon from "@/components/atoms/AtomEditIcon";
  import AtomHeadline from '@/components/atoms/AtomHeadline';

  import { accountHolderService } from "@/services/account-holder-service";
  import {numberService} from "@/services/number-service";

  export default {
    components: {
      AtomButton,
      AtomEditIcon,
      AtomHeadline,
    },

    async created() {
      try {
        if (this.$cookies.get('user')) {
          this.user = this.$cookies.get('user');
        }

        this.accountHolders = await accountHolderService.getAllByUser(this.user.id);
        this.dataLoaded = true;
      } catch (error) {
        this.loadingError = true;
        console.error(error);
      }
    },

    data() {
      return {
        accountHolders: null,
        dataLoaded: false,
        loadingError: false,
        user: null,
      };
    },

    methods: {
      formatCurrency(value) {
        return numberService.formatCurrency(value)
      },

      getAccountsTotal(accountHolder) {
        return accountHolder.bankAccounts.reduce((a, b) => a + b.balance, 0);
      },

      getCashTotal(accountHolder) {
        return accountHolder.bankAccounts.reduce((a, b) => a + b.cash, 0);
      }
    }
  }
</script>