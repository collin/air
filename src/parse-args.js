/**
 * A simplistic argument parsing function.
 *
 * Allows for flag aliasing.
 * Allows for specifying values with or without = signs
 *
 * For example:
 *
 * ```js
 * parseArgs(['--cool', '10'])
 * => { cool: '10' }
 *
 * parseArgs(['-c', '100'], { '-c': '--cool' })
 * => { cool: '100' }
 *
 *  * parseArgs(['--cool=100'])
 * => { cool: '100' }
 * ```
 *
 * Arguments without values will default to true:
 *
 * ```js
 * parseArgs(['--cool'])
 * => { cool: true }
 * ```
 *
 * @param {string[]} argList
 * @param {Record<string, string>} aliases
 * @returns
 */
export function parseArgs(argList, aliases) {
  const userArgs = argList
    .slice(2)
    .flatMap((token) =>
      token.split(/=/).map((splitToken) => aliases[splitToken] || splitToken)
    );

  const args = [];
  const options = {};

  let tokenIndex = 0;
  while (tokenIndex < userArgs.length) {
    let currentToken = userArgs[tokenIndex];
    let nextToken = userArgs[tokenIndex + 1];
    if (currentToken.startsWith("--")) {
      let optionName = currentToken.slice(2);

      if (
        nextToken === undefined ||
        (nextToken && nextToken.startsWith("--"))
      ) {
        options[optionName] = true;
        tokenIndex += 1;
      } else {
        options[optionName] = nextToken;
        tokenIndex += 2;
      }
    } else {
      args.push(currentToken);
      tokenIndex += 1;
    }
  }
  return options;
}
