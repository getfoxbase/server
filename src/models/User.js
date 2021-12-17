import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import langs from '../conf/langs'
import { $t, getDefaultLang } from '../tools/i18n'
import Role from './Role'

const SALT_WORK_FACTOR = 10

class User {
  passwordMatch (candidatePassword) {
    const currentUserPassword = this.password
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, currentUserPassword, function (
        err,
        isMatch
      ) {
        if (err) resolve(false)
        else resolve(isMatch)
      })
    })
  }

  getJWT (askLongToken = false) {
    const exp =
      Math.floor(Date.now() / 1000) + (askLongToken ? 3600 * 24 * 60 : 3600)

    return {
      jwt: jwt.sign(
        {
          id: this.id,
          role: this.role,
          exp
        },
        process.env.JWT_KEY
      ),
      expiresAt: new Date(exp * 1000)
    }
  }

  setSocialId (provider, id) {
    this.set(`socialIds.${provider}`, id + '')
  }

  static async resetPassword (email) {
    const user = await this.findOne({ email }).exec()
    if (!user) return false

    user.passwordResetCode = uuid()
    user.passwordResetExp = new Date(+new Date() + 1000 * 60 * 30) // 30 minutes
    await user.notify('resetPassword', {
      code: user.passwordResetCode
    })
    await user.save()
    return true
  }

  static async changePasswordWithResetCode (code, newPassword) {
    const user = await this.findOne({
      passwordResetCode: code,
      passwordResetExp: { $gte: new Date() }
    }).exec()
    if (!user) {
      return false
    }

    user.password = newPassword
    user.passwordResetCode = ''
    await user.save()
    return true
  }

  get name () {
    if (!this.firstname || !this.lastname) return this.email
    return `${this.firstname} ${this.lastname}`.trim()
  }

  static async createUser (email, firstname, lastname, password, lang) {
    const existingUser = await this.findOne({ email }).exec()
    if (existingUser) {
      throw new Error(
        $t('Email is already used by another account. Try to sign in.', lang)
      )
    }

    const user = new this({
      email,
      firstname,
      lastname,
      password,
      lang
    })

    await user.save()
    user._author = user._id
    await user.save()

    return user
  }

  static async activateAccountFromValidationCode (validationCode, preset = {}) {
    try {
      const user = await this.findOne({ validationCode, pending: true }).exec()
      if (!user) return false

      user.pending = false
      user.validationCode = ''
      for (let key in preset) {
        user.set(key, preset[key])
      }
      await user.save()
      return true
    } catch {
      return false
    }
  }

  static parseJwt (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY)
      return decoded
    } catch {
      return null
    }
  }

  static async getUserByJwt (token) {
    const decoded = this.parseJwt(token)
    try {
      return await this.findById(decoded.id).exec()
    } catch {
      return null
    }
  }

  static async getUserBySocialId (provider, id) {
    const query = {}
    query[`socialIds.${provider}`] = id + ''
    return await this.findOne(query).exec()
  }

  static async loginByPassword (email, password) {
    let user = null

    try {
      user = await this.findOne({ email }).exec()
      if (!user) return null
    } catch {}

    if (user.pending)
      throw new Error(
        $t(
          'This account is not validated. Please check your mailbox and validate your account.',
          user.lang
        )
      )

    if (await user.passwordMatch(password)) return user
    return null
  }

  async getRole () {
    return await Role.getRole(this.role)
  }

  export () {
    let ret = {
      id: this.id,
      role: this.role,
      email: this.email,
      firstname: this.firstname,
      lastname: this.lastname,
      avatar: this.avatar,
      lang: this.lang,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    }

    return ret
  }
}

const schema = new Schema(
  {
    _author: {
      type: mongoose.ObjectId
    },
    email: {
      type: String,
      match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
      required: true,
      index: { unique: true }
    },
    role: {
      type: String,
      default: 'user'
    },
    password: {
      type: String
    },
    socialIds: {
      type: Map,
      of: String
    },
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    avatar: {
      type: String,
      default: ''
    },
    lang: {
      type: String,
      default: getDefaultLang,
      enum: Object.keys(langs)
    },
    pending: {
      type: Boolean,
      default: true
    },
    validationCode: {
      type: String,
      default: uuid
    },
    passwordResetCode: {
      type: String
    },
    passwordResetExp: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: '_users'
  }
)

// On save, hash the new password
schema.pre('save', function (next) {
  var user = this

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next()

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      // override the cleartext password with the hashed one
      user.password = hash
      next()
    })
  })
})

schema.loadClass(User)
schema.plugin(require('mongoose-autopopulate'))
schema.plugin(require('mongoose-paginate-v2'))
schema.plugin(require('mongoose-delete'), {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true,
  indexFields: ['deleted', 'deletedBy']
})

export default mongoose.model('_users', schema)
