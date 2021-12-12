import { google } from 'googleapis'
import Provider from './Provider'

export default class Google extends Provider {
  getConnection () {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT
    )
  }

  async getRedirectUri (redirect = null, askLongToken = false) {
    const connection = this.getConnection()
    return connection.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: JSON.stringify({ redirect, askLongToken })
    })
  }

  async callback (query) {
    const auth = this.getConnection()
    const data = await auth.getToken(query.code)
    const tokens = data.tokens
    auth.setCredentials(tokens)

    var oauth2 = google.oauth2({
      auth,
      version: 'v2'
    })
    const me = await oauth2.userinfo.get()

    const state = JSON.parse(query.state)

    return {
      id: me.data.id,
      email: me.data.email,
      redirect: state.redirect,
      askLongToken: state.askLongToken,
      preset: {
        email: me.data.email,
        firstname: me.data.given_name,
        lastname: me.data.family_name,
        avatar: me.data.picture
      }
    }
  }
}
