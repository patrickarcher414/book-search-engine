const { User } = require ("../models")
const { signToken } = require ("../utils/auth")
const { AuthenticationError } = require ("apollo-server-express")

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({_id: context.user._id}).select("-__v -password")
        console.log(userData)
        return userData
       }
       throw new AuthenticationError("Please login.")
    }
  },
  Mutation: {
    login: async (parent, args) => {
      console.log(args)
      const {email, password} = args
      let user = await User.findOne({email})
      if (!user) {
        throw new AuthenticationError("Please enter a valid email.")
      }
      let correctPW = await user.isCorrectPassword(password)
      if (!correctPW) {
        throw new AuthenticationError("Please enter a valid password.")
      }
      const token = signToken(user)
      return { token, user }
    },

    addUser: async (parent, args) => {
      console.log(args)
      const newUser = await User.create(args)
      console.log(newUser)
      const token = signToken(newUser)
      console.log(token)
      return { token, newUser }
    },

    saveBook: async (parent, args, context) => {
      console.log(args)
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args.bookData } },
          { new: true }
        );
        return updateUser;
      }
      throw new AuthenticationError('Please login to save books!');
    },

    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: args } },
          { new: true }
        );
        return updateUser;
      }
      throw new AuthenticationError('Please login to remove books!');
    }
  }
};

module.exports = resolvers;