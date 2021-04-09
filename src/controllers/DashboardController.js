const Job = require('../model/Job');
const JobUtils = require('../utils/JobUtils');
const Profile = require('../model/Profile')

module.exports = {
  async index(req, res) {
    const jobs = await Job.get();
    const profile = await Profile.get();

    let statusCount = {
      progress: 0,
      done: 0,
      total: jobs.length
    }

    let jotTotalHours = 0;

    const updatedJobs = jobs.map((job) => {
      const remaining = JobUtils.remainingDays(job)    
      const status = remaining <= 0 ? 'done' : 'progress';

      //somando a quantidade de status
      statusCount[status] += 1

      jotTotalHours = status == "progress" ? jotTotalHours + Number(job['daily-hours']) : jotTotalHours

      return {
        ...job,
        remaining,
        status,
        budget: JobUtils.calculateBudget(job, profile["value-hour"])
      }
    })

    // qtd de horas que quero trabalhar menos a quantidade de horas/dia de cada job em progress

    const freeHours = profile["hours-per-day"] - jotTotalHours

    return res.render("index", { jobs: updatedJobs, profile: profile, statusCount: statusCount, freeHours: freeHours })
  }
}