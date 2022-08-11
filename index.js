const fs = require('fs')
const { isAbsolute, join } = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const { createClient } = require('@supabase/supabase-js')

async function run() {
  try {
    const bucketName = core.getInput('bucket-name') || 'www-test'
    const distFolder = core.getInput('dist-folder') || 'dist'
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('No supabase url or anon key is found!')
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: bucket, error: errGetBucket } = await supabase.storage.getBucket(bucketName)
    if (errGetBucket && !errGetBucket.message.includes('not found')) {
      core.setFailed(errGetBucket.message + '-' + supabaseUrl)
      // return
    }

    if (!bucket) {
      const { error: errCreateBucket } = await supabase.storage.createBucket(bucketName, {
        public: false
      })
      if (errCreateBucket) {
        core.setFailed(errCreateBucket.message)
        // return
      }
    }

    // read files from dist folder
    const { error: errEmptyBucket } = await supabase.storage.emptyBucket(bucketName)
    if (errEmptyBucket) {
      core.setFailed(errEmptyBucket.message)
      // return
    }

    // const filePathDir = isAbsolute(distFolder) ? distFolder : `${process.env.GITHUB_WORKSPACE}/${distFolder}`
    // filePathDir = '/dist'
    // core.debug(`Reading file: ${distFolder}`)
    // core.debug(`Reading file dir: ${filePathDir}`)

    // const files = fs.readdirSync(filePathDir)
    // for (const file of files) {
    //   core.debug(`Uploading ${join(filePathDir, file)} to ${bucketName}`)
    //   const buffer = fs.readFileSync(join(filePathDir, file))
    //   const { data, error } = await supabase.storage.from(bucketName).upload(file, buffer)
    //   if (error) throw new Error(error.message)
    //   core.debug(`Media Key: ${data?.Key}`)
    //   core.setOutput('result', data?.Key)
    // }
  } catch (error) {
    core.setFailed(error.message + ' - ' + filePathDir)
  }
}

run()
