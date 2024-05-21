/** @type {import('next').NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/new',
        destination: '/',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}
