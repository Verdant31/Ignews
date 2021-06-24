import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

import { query as q } from 'faunadb';
import { fauna } from '../../../services/faunadb';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: 'b443e3c1b556ac610cfd',
      clientSecret: '1b264b30a680680b8094ffd93b47b7ce241743e1',
      scope: 'read:user'
    }),
  ],
  callbacks: {
    async session(session) {
      try {
        const userActiveSubscripttion = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )
        return {
          ...session,
          activeSubscription: userActiveSubscripttion
        }
      } catch {
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },

    async signIn(user, account, profile) {
      console.log(user)
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch {
        return false
      }
    },
  }
})