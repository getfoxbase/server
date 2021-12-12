import axios from 'axios'
import qs from 'qs'
import Provider from './Provider'

export default class Linkedin extends Provider {
  async getRedirectUri (redirect = null, askLongToken = false) {
    const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', process.env.LINKEDIN_CLIENT_ID)
    url.searchParams.set('redirect_uri', process.env.LINKEDIN_REDIRECT)
    url.searchParams.set(
      'state',
      JSON.stringify({
        redirect,
        askLongToken
      })
    )
    url.searchParams.set('scope', 'r_liteprofile r_emailaddress')
    return url.toString()
  }

  async callback (query) {
    let token = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      qs.stringify({
        grant_type: 'authorization_code',
        code: query.code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const me = await axios.get(
      'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`
        }
      }
    )

    const email = await axios.get(
      'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))',
      {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`
        }
      }
    )

    const state = JSON.parse(query.state)

    return {
      id: me.data.id,
      email: email.data.elements?.[0]?.['handle~']?.emailAddress,
      redirect: state.redirect,
      askLongToken: state.askLongToken,
      preset: {
        email: email.data.elements?.[0]?.['handle~']?.emailAddress,
        firstname: me.data.localizedFirstName,
        lastname: me.data.localizedLastName,
        avatar:
          me.data.profilePicture?.['displayImage~'].elements?.[0]
            .identifiers?.[0]?.identifier ?? ''
      }
    }
  }
}
