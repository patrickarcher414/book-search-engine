const { User } = require ("../models")
const { signToken } = require ("../utils/auth")
const { AuthenticationError } = require ("apollo-server-express")

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
       if (context.user) {
        const userData = await User.findOne({_id: context.user._id}).select("-__v -password")
        return userData
       }
       throw new AuthenticationError("Please login.")
    }
  },
  Mutation: {
    login: async (parent, args) => {
      const {email, password} = args
      let user = await User.findOne({email})
      if (!user) {
        throw new AuthenticationError("Please enter valid email.")
      }
      let correctPW = await user.isCorrectPassword(password)
      if (!correctPW) {
        throw new AuthenticationError("Please enter a valid password!")
      }
      const token = signToken(user)
      return { token, user }
    },
    addUser: async (parent, args) => {
      
    },
    saveBook: async (parent, args, context) => {
      
    },
    removeBook: async (parent, args, context) => {
      
    }
  }
};

module.exports = resolvers;