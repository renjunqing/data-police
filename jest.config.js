module.exports = {
  testMatch: ["<rootDir>/test/**/*.js"],
  transform: {
      "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(exact-calculation)/)"]
};