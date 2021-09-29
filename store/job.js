import JobScrapper from "~/JobScrapper"

// Actions
export const actions = {
  async getJobs({ commit }) {
    const data = await JobScrapper.getJobs()
    if (data.total_jobs) {
      commit('STORE_JOBS', data)
      return data.jobs
    }
  }
}

// Mutation
export const mutations = {
  STORE_JOBS(state, payload) {
    state.jobs = payload.jobs
    state.total_jobs = payload.total_jobs
  }
}

// Getter
export const getters = {
  getJobs: (state) => () => {
    return state.jobs
  }
}

// State
export const state = () => ({
  jobs: [],
  total_jobs: 0
})
