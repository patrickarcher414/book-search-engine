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
      const newUser = await User.create(args)
      const token = signToken(newUser)
      return { token, newUser}
    },

    saveBook: async (parent, {bookData}, context) => {
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );
        return updateUser;
      }
      throw new AuthenticationError('Please login to save books!');
    },

    removeBook: async (parent, {bookId}, context) => {
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: bookId } },
          { new: true }
        );
        return updateUser;
      }
      throw new AuthenticationError('Please login to remove books!');
    }
  }
};

module.exports = resolvers;