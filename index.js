const core = require('@actions/core')
const github = require('@actions/github')
const { createClient } = require('@supabase/supabase-js')

try {
  const backetName = core.getInput('bucket-name')
  const distFolder = core.getInput('dist-folder')

  const supabaseUrl = core.getInput('SUPABASE_URL')
  const supabaseAnonKey = core.getInput('SUPABASE_ANON_KEY')

  console.log(`Bucket name: ${backetName}`)
  console.log(`Dist folder: ${distFolder}`)
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log(`Supabase Anon Key: ${supabaseAnonKey}`)

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase.storage.getBucket(backetName)
  if (error) {
    core.setFailed(error.message)
    return
  }
  console.log(`Bucket: ${JSON.stringify(data)}`)

  // // `who-to-greet` input defined in action metadata file
  // const nameToGreet = core.getInput('who-to-greet')
  // console.log(`Hello ${nameToGreet}!`)
  // const time = new Date().toTimeString()
  // core.setOutput('time', time)
  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`)
} catch (error) {
  core.setFailed(error.message)
}
