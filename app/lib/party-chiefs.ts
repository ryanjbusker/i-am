export type PartyChief = {
  id: string;
  name: string;
};

export type Crew = {
  id: string;
  name: string;
  chiefs: PartyChief[];
};

export const crews: Crew[] = [
  {
    id: "party-chiefs",
    name: "Party Chiefs",
    chiefs: [
      { id: "jordan-haven", name: "Jordan Haven" },
      { id: "donnie-johnson", name: "Donnie Johnson" },
      { id: "mike-kennedy", name: "Mike Kennedy" },
      { id: "steven-kaldanis", name: "Steven Kaldanis" },
      { id: "luis-rivero", name: "Luis Rivero" },
      { id: "tyler-alridge", name: "Tyler Alridge" },
      { id: "andy-brito", name: "Andy Brito" },
      { id: "cody-grissom", name: "Cody Grissom" },
      { id: "zack-page", name: "Zack Page" },
    ],
  },
  {
    id: "woodlands",
    name: "Woodlands Party Chiefs",
    chiefs: [
      { id: "arturo-valtierra", name: "Arturo Valtierra" },
      { id: "jaciery-linzer", name: "Ja'Ciery Linzer" },
      { id: "rod-chandler", name: "Rod Chandler" },
      { id: "jacob-moore", name: "Jacob Moore" },
      { id: "peter-baumhogger", name: "Peter Baumhogger" },
      { id: "matt-marek", name: "Matt Marek" },
      { id: "masen-gorman", name: "Masen Gorman" },
      { id: "dustin-coffee", name: "Dustin Coffee" },
    ],
  },
];

export const partyChiefs: PartyChief[] = crews.flatMap((crew) => crew.chiefs);

export function findChief(id: string): PartyChief | undefined {
  return partyChiefs.find((chief) => chief.id === id);
}
