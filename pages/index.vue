<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>Salut</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Carte</th>
              <th>Coin</th>
              <th>Conso</th>
              <th>Rate</th>
              <th>Reward/jours</th>
              <th>Reward/mois</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cg, i) in jobs" :key="i">
              <td>
                <a :href="cg.link">{{ cg.name }}</a>
              </td>
              <td>{{ cg.coin }}</td>
              <td>{{ cg.power }}</td>
              <td>{{ cg.rate }}</td>
              <td>{{ cg.est }}</td>
              <td>{{ cg.est | calculateMonthRwd }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  filters: {
    calculateMonthRwd(est) {
      const value = +est.slice(1, est.length)
      return `$${(value * 30.41).toFixed(2)}`
    },
  },
  async asyncData({ store }) {
    const getJobs = store.getters['job/getJobs']
    let jobs = getJobs()
    if (!jobs.length) {
      jobs = await store.dispatch('job/getJobs')
    }

    return { jobs }
  },
  data() {
    return {
      jobs: [],
    }
  },
}
</script>
