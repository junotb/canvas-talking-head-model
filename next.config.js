/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SPEECH_KEY: process.env.SPEECH_KEY,
    SPEECH_REGION: process.env.SPEECH_REGION,
  }
}

module.exports = nextConfig
