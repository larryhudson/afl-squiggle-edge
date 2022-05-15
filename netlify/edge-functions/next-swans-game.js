export default async (request, context) => {
  // check for authorization header
  if (
    request.headers.get("Authorization") !==
    Deno.env.get("SUPER_SECRET_PASSWORD")
  ) {
    return new Response("Not authorized", {
      status: 403,
    });
  }

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

  const SYDNEY_SWANS_ID = 16;

  const nextGame = incompleteGamesInCurrentYear.find(
    (game) =>
      game.ateamid === SYDNEY_SWANS_ID || game.hteamid === SYDNEY_SWANS_ID
  );

  console.log(nextGame);

  const dateString = new Date(nextGame.date).toLocaleDateString("en-au", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return new Response(
    `${nextGame.hteam} play ${nextGame.ateam} at ${nextGame.venue} on ${dateString}`
  );
};
