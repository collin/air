module.exports.parseArgs = function parseArgs(argList, flagExpansions) {
  const argSlice = argList.indexOf(require.main.filename);
  const userArgs = argList
    .slice(argSlice + 1)
    .flatMap(token =>
      token
        .split(/=/)
        .map(splitToken => flagExpansions[splitToken] || splitToken),
    );

  const args = [];
  const options = {};

  let tokenIndex = 0;
  while (tokenIndex < userArgs.length) {
    let currentToken = userArgs[tokenIndex];
    let nextToken = userArgs[tokenIndex + 1];
    if (currentToken.startsWith('--')) {
      let optionName = currentToken.slice(2);

      if (
        nextToken === undefined ||
        (nextToken && nextToken.startsWith('--'))
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
  return [args, options];
}
