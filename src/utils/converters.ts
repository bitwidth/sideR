export class ConverterUtils {
  public static convertSecondsToMilliSeconds = (seconds: number) => {
    if (!seconds) {
      return 0;
    }

    return seconds * 1000;
  }

  public static convertMilliSecondsToSeconds = (millis: number, integerResult: boolean = true) => {
    if (!millis) {
      return 0;
    }

    if (integerResult) {
      return Math.floor(millis / 1000);
    } else {
      return millis / 1000;
    }
  }
}