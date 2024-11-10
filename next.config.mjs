/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/dashboard',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/dashboard',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
      // {
      //   source: '/api/v1/:path*',
      //   destination: `${process.env.NEXT_PUBLIC_BASE_API}/api/v1/:path*`,
      //   permanent: true,
      //   locale: false
      // }
    ]
  }
}

export default nextConfig
