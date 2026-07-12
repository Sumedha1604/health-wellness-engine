module.exports = {
    testEnvironment: "node",

    testMatch: [
        "**/tests/**/*.test.js",
    ],

    collectCoverage: true,

    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
    ],

    coverageDirectory: "coverage",

    coverageReporters: [
        "text",
        "lcov",
        "html",
    ],

    coverageThreshold: {
        global: {
            branches: 65,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },

    verbose: true,

    setupFilesAfterEnv: [
        "<rootDir>/tests/setup.js",
    ],
};