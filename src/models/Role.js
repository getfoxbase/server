import mongoose, { Schema } from 'mongoose'

class Role {
  static async getRole (slug) {
    return await this.findOne({ slug }).exec()
  }

  static async ensureBasicRoles () {
    await this.ensureRole('admin', {
      name: 'Admin',
      anonymous: false,
      allAccess: true,
      collections: {},
      deletable: false
    })
    await this.ensureRole('anonymous', {
      name: 'Anonymous',
      anonymous: true,
      allAccess: false,
      collections: {},
      deletable: false
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
    anonymous: {
      type: Boolean,
      default: false
    },
    allAccess: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: true
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
