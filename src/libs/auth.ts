// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// import { PrismaClient } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'

import { login } from '@/api/user/login'

import { loginWithGoogleAccount } from '@/api/user/verifyUser'
// const prisma = new PrismaClient()
const tokenExpiresIn = parseInt(process.env.NEXT_TOKEN_EXPIRES_IN as string, 10)

export const authOptions: NextAuthOptions = {
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   callbackUrl: {
  //     name: `__Secure-next-auth.callback-url`,
  //     options: {
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   csrfToken: {
  //     name: `__Host-next-auth.csrf-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   pkceCodeVerifier: {
  //     name: `anext-auth.pkce.code_verifier`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true,
  //       maxAge: 900
  //     }
  //   },
  //   state: {
  //     name: `anext-auth.state`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true,
  //       maxAge: 900
  //     }
  //   },
  //   nonce: {
  //     name: `anext-auth.nonce`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   }
  // },
  // adapter: PrismaAdapter(prisma) as Adapter,

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},

      //@ts-ignore
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        const { email, password } = credentials as { email: string; password: string }

        try {
          // ** Login API Call to match the user credentials and receive user data in response along with his role
          // const res = await fetch(`${process.env.API_URL}/login`, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json'
          //   },
          //   body: JSON.stringify({ email, password })
          // })

          const { data, token } = await login(email, password)

          return { data, token }
        } catch (e: any) {
          throw new Error(e)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: tokenExpiresIn // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    // async redirect({ url, baseUrl }) {
    //   // 检查 url 是否是允许的重定向地址
    //   if (url.includes('redirectTo')) {
    //     // 如果是相对路径，重定向到该路径
    //     return `${baseUrl}${url.substring(url.indexOf('redirectTo=') + 11)}`
    //   }
    //   // 否则，重定向到首页
    //   return baseUrl
    // },
    async jwt({ token, user, account }) {
      //@ts-ignore
      let googleUser
      if (account && account.provider === 'google') {
        //const cursomToken = user as any
        //
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */

        //@ts-ignore
        // const checkRegData = await checkUserHasRegisted(user, { email: user.email })
        // if (checkRegData.message && checkRegData.message === 'User is not existing') {
        const loginWithGoogleAccountResponse = await loginWithGoogleAccount(
          user.id,
          user.email as string,
          user.image as string,
          user.name as string
        )
        //@ts-ignore
        googleUser = loginWithGoogleAccountResponse.data
        //@ts-ignore
        googleUser.token = loginWithGoogleAccountResponse.token
        // } else {
        //    //@ts-ignore
        //    googleUser = checkRegData.data
        //    //@ts-ignore
        //    googleUser = checkRegData.token
        // }
      }
      //@ts-ignore
      let jwtUser
      if (googleUser) {
        jwtUser = googleUser
      } else if (user) {
        //@ts-ignore
        jwtUser = user.data
        //@ts-ignore
        jwtUser.token = user.token
      }
      if (jwtUser) {
        //@ts-ignore
        token.name = jwtUser?.nickName || jwtUser?.username
        //@ts-ignore
        token.email = jwtUser?.email
        //@ts-ignore
        token._id = jwtUser._id
        //@ts-ignore
        token.code = jwtUser?.code
        //@ts-ignore
        token.username = jwtUser?.username
        //@ts-ignore
        token.nickName = jwtUser?.nickName
        //@ts-ignore
        token.userImg = jwtUser?.userImg
        //@ts-ignore
        token.recordEmail = jwtUser?.recordEmail ?? ''
        //@ts-ignore
        token.timeZone = jwtUser?.timeZone
        //@ts-ignore
        token.address = jwtUser?.address
        //@ts-ignore
        token.personal = jwtUser?.personal
        //@ts-ignore
        token.website = jwtUser?.website ?? ''
        //@ts-ignore
        token.bio = jwtUser?.bio ?? ''
        //@ts-ignore
        token.accessToken = jwtUser?.token ?? ''
        //@ts-ignore
        token.googleId = jwtUser?.googleId ?? ''
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        //@ts-ignore
        session.user.email = token.email
        //@ts-ignore
        session.user.name = token.name
        //@ts-ignore
        session.user._id = token._id
        //@ts-ignore
        session.user.code = token.code
        //@ts-ignore
        session.user.username = token.username
        //@ts-ignore
        session.user.nickName = token.nickName
        //@ts-ignore
        session.user.userImg = token.userImg
        //@ts-ignore
        session.user.recordEmail = token.recordEmail
        //@ts-ignore
        session.user.timeZone = token.timeZone
        //@ts-ignore
        session.user.address = token.address
        //@ts-ignore
        session.user.personal = token.personal
        //@ts-ignore
        session.user.website = token.website ?? ''
        //@ts-ignore
        session.user.bio = token.bio ?? ''
        //@ts-ignore
        session.user.activationToken = token.accessToken
        //@ts-ignore
        session.user.googleId = token.googleId ?? ''
        //@ts-ignore
        //session.user.token = token.token

        //@ts-ignore
        // session.user.accessToken = jwt.sign(
        //   {
        //     data: {
        //       _id: token._id,
        //       code: token.code,
        //       email: token._id,
        //       recordEmail: token._id,
        //       username: token._id,
        //       userImg: token._id,
        //       bkgImg: token._id
        //     }
        //   },
        //   process.env.NEXTAUTH_SECRET as string,
        //   { expiresIn: tokenExpiresIn }
        // )
      }

      return session
    }
  }
}
