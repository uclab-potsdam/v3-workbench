export default {
  server: process.env.VUE_APP_SERVER,
  fileServer: process.env.VUE_APP_FILE_SERVER,
  database: process.env.VUE_APP_DB,
  branch: process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BRANCH : process.env.VUE_APP_BRANCH_DEV,
  lang: process.env.VUE_APP_LANGUAGE,
  languages: process.env.VUE_APP_LANGUAGES.split(',').map(d => d.trim())
}
