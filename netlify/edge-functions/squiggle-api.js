export default async (request, context) => {
  // current year
  const now = new Date();
  const year = now.getFullYear();

  // work out which round is the current round
  // by fetching the incomplete games in the current year
  const incompleteGamesResponse = await fetch(
    `https://api.squiggle.com.au/?q=games&year=${year}&complete=!100`
  );

  if (!incompleteGamesResponse.ok)
    return {
      statusCode: incompleteGamesResponse.statusCode,
      body: incompleteGamesResponse.statusText,
    };

  const incompleteGamesInCurrentYear = await incompleteGamesResponse
    .json()
    .then((json) => json.games);

  if (incompleteGamesInCurrentYear.length === 0) {
    return new Response(`The year is over.`);
  }

  const currentRound = incompleteGamesInCurrentYear[0].round;

  const incompleteGamesInCurrentRound = incompleteGamesInCurrentYear.filter(
    (g) => g.round === currentRound
  );

  const liveGames = incompleteGamesInCurrentRound.filter(
    (g) => g.complete !== 0
  );

  if (liveGames.length === 0) {
    return new Response("No games have started.");
  }

  const liveGameSummaries = liveGames.map((game) => {
    const margin = Math.abs(game.hscore - game.ascore);

    const homeLeading = game.hscore > game.ascore;

    return margin === 0
      ? `${game.hteam} (${game.hgoals} ${game.hbehinds} ${game.hscore}) and ${game.ateam} (${game.agoals} ${game.abehinds} ${game.ascore}) are even at ${game.venue}. ${game.timestr}.`
      : homeLeading
      ? `${game.hteam} (${game.hgoals} ${game.hbehinds} ${game.hscore}) leads ${game.ateam} (${game.agoals} ${game.abehinds} ${game.ascore}) by ${margin} points at ${game.venue}. ${game.timestr}.`
      : `${game.ateam} (${game.agoals} ${game.abehinds} ${game.ascore}) leads ${game.hteam} (${game.hgoals} ${game.hbehinds} ${game.hscore}) by ${margin} points at ${game.venue}. ${game.timestr}.`;
  });

  return new Response(liveGameSummaries.join("\n\n"));
};
