// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

export interface Config {
    admin: string;
}

export async function handlePullRequest (context: Context): Promise<void> {
  const config = (await context.config('assign_to_admin.yml')) as Config
  if (!config) {
    throw new Error('the configuration file failed to load')
  }
  const {
    admin
  } = config;
  context.log('admin: ', admin[0]);
  if (context.payload.pull_request.draft) {
    context.log('ignore draft PR')
    return
  }
  const owner = context.payload.pull_request.user.login as string;
  if (admin[0] === owner) {
    context.log('submitter same as admin - ignoring')
    return
  }
  try {
      const params = context.issue({ reviewers: [admin[0]] })
      const result = await context.github.pulls.createReviewRequest(params)
      context.log(result)
  } catch (error) {
    context.log(error)
  }
}
