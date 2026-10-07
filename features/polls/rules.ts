/**
 * Vote rules as a pure function (tested, no DB): returns the message to show, or null when valid.
 * An empty list is valid: it removes the vote.
 */
export function voteError(
  poll: { options: string[]; isMulti: boolean; expiresAt: Date | null },
  choices: string[],
  now = new Date(),
) {
  if (poll.expiresAt !== null && poll.expiresAt <= now) return "Ce sondage est terminé";
  if (new Set(choices).size !== choices.length) return "Un choix est en double";
  if (choices.some((choice) => !poll.options.includes(choice))) return "Ce choix n'existe pas dans le sondage";
  if (!poll.isMulti && choices.length > 1) return "Un seul choix possible pour ce sondage";
  return null;
}
