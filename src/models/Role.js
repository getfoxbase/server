import mongoose, { Schema } from 'mongoose'

class Role {
  static async getRole (slug) {
    return await this.findOne({ slug }).exec()
  }

  static async getDefaultUserRole () {
    return await this.findOne({ defaultUserRole: true }).exec()
  }

  static async getDefaultAnonymousRole () {
    return await this.findOne({ defaultAnonymousRole: true }).exec()
  }

  static async ensureBasicRoles () {
    await this.ensureRole('admin', {
      name: 'Admin',
      allAccess: true,
      collections: {}
    })
    await this.ensureRole('user', {
      name: 'User',
      defaultUserRole: true,
      allAccess: false,
      collections: {
        _users: {
          read: false,
          write: false,
          delete: false,
          author: true,
          admin: false
        }
      }
    })
    await this.ensureRole('anonymous', {
      name: 'Anonymous',
      defaultAnonymousRole: true,
      allAccess: false,
      collections: {
        _users: {
          read: false,
          write: false,
          delete: false,
          author: true,
          admin: false
        }
      }
    })
  }

  static async ensureRole (slug, conf) {
    const role = await this.getRole(slug)
    if (!role) {
      const newRole = new this({
        ...conf,
        slug
      })
      await newRole.save()
    }
  }
}

const schema = new Schema(
  {
    _author: {
      type: mongoose.ObjectId
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    defaultAnonymousRole: {
      type: Boolean,
      default: false
    },
    defaultUserRole: {
      type: Boolean,
      default: false
    },
    allAccess: {
      type: Boolean,
      default: false
    },
    collections: {
      type: Map,
      of: new Schema({
        read: {
          type: Boolean,
          default: false
        },
        write: {
          type: Boolean,
          default: false
        },
        delete: {
          type: Boolean,
          default: false
        },
        author: {
          type: Boolean,
          default: false
        },
        admin: {
          type: Boolean,
          default: false
        }
      })
    }
  },
  {
    timestamps: true,
    collection: '_roles'
  }
)

schema.loadClass(Role)

export default mongoose.model('_roles', schema)
