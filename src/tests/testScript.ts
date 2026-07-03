import net from "node:net";
import { EventEmitter } from "node:events";
import { DEFAULT_SERVER_CONFIGURATION } from "../constants/configs.js";
import { checkArrayEquality } from "../utils/comparators.js";
import { readFileSync, writeFileSync } from "node:fs";

const testsString = readFileSync("tests.json", "utf-8");
const tests = JSON.parse(testsString);

let testNames = tests.map((test: any) => test.name);
let testData = tests.map((test: any) => test.commands);
let testResults = tests.map((test: any) => test.results);

let testIndex = 0;

// Flow mental model
// "start"
// "next"
// "data"
// "data"
// "verifyTestResult"
// "next"
// "end"

let expectedNumberOfTestCaseResults = 0;
let actualNumberOfTestCaseResults = 0;
let currentTestResult: any[] = [];
let overflowedResults: any[] = [];
const allTestResults: any[] = [];

const afterEach = () => {
  expectedNumberOfTestCaseResults = 0;
  actualNumberOfTestCaseResults = 0;
  currentTestResult = [];

  actualNumberOfTestCaseResults = overflowedResults.length;
  currentTestResult = [...overflowedResults];
  overflowedResults = [];
};

const testSocket = new net.Socket({});
const testSignals = new EventEmitter();

testSignals.on("start", () => {
  testIndex = -1;
  testSignals.emit("next");
});

testSignals.on("next", (data) => {
  testIndex += 1;

  if (testIndex >= testData.length) {
    testSignals.emit("end", allTestResults);
  } else {
    for (const item of testData[testIndex]) {
      testSocket.write(item);
      expectedNumberOfTestCaseResults += 1;
    }
  }
});

testSignals.on("verifyTestResult", (...args) => {
  const actualTestResults = args[0];
  const testCaseIndex = args[1];
  const expectedTestResults = testResults[testCaseIndex] ?? [];

  let isTestPassed = true;
  for (let iterator = 0; iterator < expectedTestResults.length; iterator++) {
    const expectedTestResult = expectedTestResults[iterator];
    const actualTestResult = actualTestResults[iterator] ?? null;
    const expectedData = expectedTestResult?.data ?? [];

    const expectedAResultButNoValueFound =
      expectedTestResult && !actualTestResult;
    if (expectedAResultButNoValueFound) {
      isTestPassed = false;
      break;
    }
    const expectedResultNotMatchingActual = Array.isArray(
      expectedTestResult?.data,
    )
      ? expectedTestResult?.status !== actualTestResult.status ||
        expectedTestResult?.data.length !== actualTestResult.data.length ||
        !checkArrayEquality(expectedTestResult?.data, actualTestResult.data) ||
        expectedTestResult?.message !== actualTestResult.message
      : expectedTestResult?.status !== actualTestResult.status ||
        expectedTestResult?.data !== actualTestResult.data ||
        expectedTestResult?.message !== actualTestResult.message;
    // console.log("expectedAResultButNoValueFound", expectedAResultButNoValueFound)
    // console.log("expectedResultNotMatchingActual", expectedResultNotMatchingActual)

    if (expectedResultNotMatchingActual) {
      isTestPassed = false;
      break;
    }
  }

  const testName = testNames[testCaseIndex];
  allTestResults.splice(testCaseIndex, 0, {
    isTestPassed,
    expectedTestResults,
    actualTestResults,
  });
  if (isTestPassed) {
    console.log("PASS. ", testName);
  } else {
    console.log("FAIL. ", testName);
  }

  afterEach();
  testSignals.emit("next");
});

testSignals.on("end", (...args) => {
  const receivedAllTestResults: any[] = args[0];
  const passedTests = receivedAllTestResults.filter(
    (value) => !!value.isTestPassed,
  );
  console.log(
    `\nPassed: ${passedTests.length}/${receivedAllTestResults.length}`,
  );
  if (passedTests.length !== receivedAllTestResults.length) {
    console.log(`Failed tests: `);
    for (
      let iterator = 0;
      iterator < receivedAllTestResults.length;
      iterator++
    ) {
      const result = receivedAllTestResults[iterator];
      if (!result.isTestPassed) {
        console.log(
          `Failed: Name \t= ${testNames[iterator]}\n\tExpect \t= ${JSON.stringify(result.expectedTestResults)}\n\tActual \t= ${JSON.stringify(result.actualTestResults)}\n`,
        );
      }
    }
  }

  testSocket.destroy();
  console.log("\nSocket destroyed.");
  testSignals.removeAllListeners();
  console.log("Tests ended.");
});

testSocket.on("data", (...args) => {
  const allResponses = args[0].toLocaleString();
  const responses = allResponses.split("\n").filter((value) => !!value);
  let currentCount = 0;
  for (const response of responses) {
    const responseJSON = JSON.parse(response.trim());
    actualNumberOfTestCaseResults += 1;
    currentCount += 1;
    if (actualNumberOfTestCaseResults <= expectedNumberOfTestCaseResults) {
      currentTestResult.push(responseJSON);
    } else {
      overflowedResults.push(responseJSON);
      actualNumberOfTestCaseResults -= 1;
    }
  }

  if (actualNumberOfTestCaseResults === expectedNumberOfTestCaseResults) {
    testSignals.emit("verifyTestResult", [...currentTestResult], testIndex);
  }
});

testSocket.connect(
  {
    port: DEFAULT_SERVER_CONFIGURATION.port,
    host: DEFAULT_SERVER_CONFIGURATION.host,
    // Idk what these 2 below are
    // localAddress: "127.0.0.1",
    // localPort: serverConfiguration.port,
  },
  () => {
    console.log("Test socket started\n");
    testSignals.emit("start");
  },
);

// function tests(socket: net.Socket) {
//   // // INvalid key length
//   // setTimeout(() => {
//   //   console.log("Sending data over")
//   //   socket.write("");
//   // }, 1000);
// }
