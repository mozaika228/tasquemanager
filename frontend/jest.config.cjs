module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/styleMock.js"
  },
  moduleFileExtensions: ["js", "jsx"],
  collectCoverageFrom: [
    "src/api.js"
  ],
  coverageThreshold: {
    global: {
      lines: 60,
      statements: 60,
      branches: 50,
      functions: 60
    }
  }
};