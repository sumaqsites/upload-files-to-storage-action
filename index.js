const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const { createClient } = require('@supabase/supabase-js')

async function run() {
  try {
    const bucketName = core.getInput('bucket-name') || 'www-test'
    const distFolder = core.getInput('dist-folder') || 'dist'
    const supabaseUrl = core.getInput('SUPABASE_URL') || process.env.SUPABASE_URL
    const supabaseAnonKey = core.getInput('SUPABASE_ANON_KEY') || process.env.SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: bucket, error: errGetBucket } = await supabase.storage.getBucket(bucketName)
    if (errGetBucket && !errGetBucket.message.includes('not found')) {
      core.setFailed(errGetBucket.message)
      return
    }
    if (!bucket) {
      const { data: newBucket, error: errCreateBucket } = await supabase.storage.createBucket(bucketName, {
        public: false
      })
      if (errCreateBucket) {
        core.setFailed(errCreateBucket.message)
        return
      }
    }

    // read files from dist folder
    const { error: errEmptyBucket } = await supabase.storage.emptyBucket(bucketName)
    if (errEmptyBucket) {
      core.setFailed(errEmptyBucket.message)
      return
    }
    const filesPath = path.join(__dirname, distFolder)
    const files = fs.readdirSync(filesPath)
    for (const file of files) {
      core.log(`Uploading ${path.join(filesPath, file)} to ${bucketName}`)
      const buffer = fs.readFileSync(path.join(filesPath, file))
      const { data, error } = await supabase.storage.from(bucketName).upload(file, buffer)
      // const filePath = path.join(__dirname, distFolder, file)
      if (error) throw new Error(error.message)
      core.debug(`Media Key: ${data?.Key}`)
      core.setOutput('result', data?.Key)
    }
  } catch (error) {
    console.error(error.message)
    core.setFailed(error.message)
  }
}

run()
