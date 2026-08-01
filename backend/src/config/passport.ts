import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './db'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5007/api/v1'}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName

        if (!email) {
          return done(new Error('No email found from Google profile'))
        }

        let user = await prisma.user.findFirst({
          where: { email },
          select: {
            id: true,
            name: true,
            role: true,
            provider: { select: { id: true, identityStatus: true } },
            isActive: true,
            deletedAt: true,
          },
        })

        if (user && (!user.isActive || user.deletedAt)) {
          return done(new Error('Account disabled or deleted'))
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: name || email.split('@')[0],
              email,
              role: 'CUSTOMER',
            },
            select: {
              id: true,
              name: true,
              role: true,
              provider: { select: { id: true, identityStatus: true } },
              isActive: true,
              deletedAt: true,
            },
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)

export default passport
