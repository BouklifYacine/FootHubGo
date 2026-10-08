type ClubOwner = { userId: string; clubName: string };

/**
 * The first club whose OWNER is among `userIds` (pure, tested): a club must keep its owner (who pays
 * the subscription and alone can delete it), so the owner hands the club over before being deleted.
 * Section coaches no longer block a deletion: the club OWNER / ADMIN appoint new ones.
 */
export function clubLosingItsOwner(owners: ClubOwner[], userIds: string[]) {
  return owners.find((owner) => userIds.includes(owner.userId)) ?? null;
}
