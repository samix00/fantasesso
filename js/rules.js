/**
 * Database predefinito dei Bonus e Malus per Fantasesso
 */
const DEFAULT_RULES = [
  // --- FLIRT & APPROCCI ---
  {
    id: "flirt_match",
    name: "Match proficuo",
    points: 5,
    category: "flirt",
    description: "Match su app d'incontri che porta a una conversazione vera di almeno 24h.",
    type: "bonus"
  },
  {
    id: "flirt_number",
    name: "Numero strappato dal vivo",
    points: 15,
    category: "flirt",
    description: "Approccio dal vivo con successo e scambio di numero o contatto Instagram.",
    type: "bonus"
  },
  {
    id: "flirt_first_kiss",
    name: "Primo bacio al primo date",
    points: 15,
    category: "flirt",
    description: "Bacio scattato al primo appuntamento.",
    type: "bonus"
  },
  {
    id: "flirt_drink",
    name: "Drink offerto con fascino",
    points: 10,
    category: "flirt",
    description: "Ricevere un drink offerto da uno/a sconosciuto/a al bancone.",
    type: "bonus"
  },
  {
    id: "flirt_club_kiss",
    name: "Limone in pista",
    points: 20,
    category: "flirt",
    description: "Bacio passionale in discoteca o a una festa.",
    type: "bonus"
  },
  {
    id: "flirt_foreign",
    name: "Fascino internazionale",
    points: 35,
    category: "flirt",
    description: "Bacio o intesa con persona straniera all'estero o turista in visita.",
    type: "bonus"
  },
  {
    id: "flirt_double_date",
    name: "Double Date riuscita",
    points: 20,
    category: "flirt",
    description: "Uscita a 4 organizzata con un amico/a della lega.",
    type: "bonus"
  },

  // --- SPICY & INTIMITÀ ---
  {
    id: "spicy_first_date",
    name: "Goal al primo appuntamento",
    points: 50,
    category: "spicy",
    description: "Conclusione intima completa già al primissimo appuntamento.",
    type: "bonus"
  },
  {
    id: "spicy_morning",
    name: "Morning Glory",
    points: 30,
    category: "spicy",
    description: "Rapporto mattutino appena svegli.",
    type: "bonus"
  },
  {
    id: "spicy_shower",
    name: "Doccia bollente",
    points: 25,
    category: "spicy",
    description: "Rapporto intimo sotto la doccia o nella vasca.",
    type: "bonus"
  },
  {
    id: "spicy_car",
    name: "Macchina appannata",
    points: 35,
    category: "spicy",
    description: "Rapporto in auto in pieno stile camporella.",
    type: "bonus"
  },
  {
    id: "spicy_toys",
    name: "Spicy Accessories",
    points: 30,
    category: "spicy",
    description: "Utilizzo consensuale di sex toys, costumi o accessori particolari.",
    type: "bonus"
  },
  {
    id: "spicy_round2",
    name: "Doppietta lampo",
    points: 40,
    category: "spicy",
    description: "Round 2 completato entro 60 minuti dal primo.",
    type: "bonus"
  },
  {
    id: "spicy_marathon",
    name: "Maratona olimpica",
    points: 75,
    category: "spicy",
    description: "3 o più rapporti completi nell'arco della stessa giornata (24 ore).",
    type: "bonus"
  },
  {
    id: "spicy_breakfast",
    name: "Gentiluomo / Gentildonna",
    points: 25,
    category: "spicy",
    description: "Preparare o portare la colazione a letto dopo la notte insieme.",
    type: "bonus"
  },

  // --- LOCATION INSOLITE ---
  {
    id: "loc_outdoor",
    name: "Natura selvaggia",
    points: 60,
    category: "location",
    description: "Rapporto all'aperto (spiaggia di notte, bosco, prato appartato).",
    type: "bonus"
  },
  {
    id: "loc_club_toilet",
    name: "Brivido nel club",
    points: 45,
    category: "location",
    description: "Intimità nel bagno di una discoteca o locale affollato.",
    type: "bonus"
  },
  {
    id: "loc_balcony",
    name: "Vista panoramica",
    points: 50,
    category: "location",
    description: "Rapporto in balcone o terrazza a cielo aperto.",
    type: "bonus"
  },
  {
    id: "loc_tent",
    name: "Camping passion",
    points: 35,
    category: "location",
    description: "Intimità in tenda durante un campeggio o festival.",
    type: "bonus"
  },
  {
    id: "loc_hood",
    name: "Cofano ribelle",
    points: 40,
    category: "location",
    description: "Intimità sul cofano o baule dell'auto.",
    type: "bonus"
  },

  // --- GOLIARDIA & SOCIAL ---
  {
    id: "fun_walk_of_shame",
    name: "Walk of Fame (or Shame)",
    points: 25,
    category: "goliardia",
    description: "Rientro a casa la mattina dopo con gli stessi vestiti della festa e passo fiero.",
    type: "bonus"
  },
  {
    id: "fun_wingman",
    name: "Spalla dell'anno",
    points: 20,
    category: "goliardia",
    description: "Aiutare un amico/a della lega a rimorchiare intrattenendo l'amico/a noioso/a.",
    type: "bonus"
  },
  {
    id: "fun_group_witness",
    name: "Spettatori paganti",
    points: 20,
    category: "goliardia",
    description: "L'approccio vincente avviene davanti agli occhi increduli degli amici della lega.",
    type: "bonus"
  },
  {
    id: "fun_selfie",
    name: "Prova inconfutabile",
    points: 15,
    category: "goliardia",
    description: "Selfie inviato nella chat di gruppo la mattina successiva con sorriso a 32 denti.",
    type: "bonus"
  },

  // --- MALUS & CRINGE ---
  {
    id: "malus_ghosting",
    name: "Ghosting subito",
    points: -20,
    category: "malus",
    description: "Visualizzato senza risposta per più di 48 ore dopo un buon appuntamento.",
    type: "malus"
  },
  {
    id: "malus_friendzone",
    name: "Friendzone certificata",
    points: -30,
    category: "malus",
    description: "Frase fatidica: 'Sei troppo importante, ti vedo più come un fratello/sorella'.",
    type: "malus"
  },
  {
    id: "malus_wrong_name",
    name: "Gaffe letale: Nome dell'ex",
    points: -50,
    category: "malus",
    description: "Chiamare l'altra persona con il nome del proprio ex durante un momento intimo.",
    type: "malus"
  },
  {
    id: "malus_late_cancel",
    name: "Bidone last minute",
    points: -25,
    category: "malus",
    description: "Appuntamento disdetto dall'altra persona a meno di un'ora dal ritrovo.",
    type: "malus"
  },
  {
    id: "malus_cramps",
    name: "Infortunio muscolare",
    points: -15,
    category: "malus",
    description: "Crampo doloroso al polpaccio o alla coscia nel bel mezzo dell'azione.",
    type: "malus"
  },
  {
    id: "malus_busted",
    name: "Beccati sul fatto",
    points: -40,
    category: "malus",
    description: "Sorpresi da genitori, coinquilini o guardiano notturno.",
    type: "malus"
  },
  {
    id: "malus_drunk_fail",
    name: "Blackout alcolico",
    points: -35,
    category: "malus",
    description: "Alzare troppo il gomito e addormentarsi o dover abbandonare il campo.",
    type: "malus"
  },
  {
    id: "malus_stall",
    name: "Falsa partenza / Cilecca",
    points: -25,
    category: "malus",
    description: "L'emozione o la stanchezza gioca un brutto scherzo sul più bello.",
    type: "malus"
  },
  {
    id: "malus_ex_talk",
    name: "Monologo sull'ex",
    points: -20,
    category: "malus",
    description: "Parlare del/della proprio/a ex per oltre 15 minuti durante l'appuntamento.",
    type: "malus"
  },
  {
    id: "malus_drunk_text",
    name: "Messaggino notturno vietato",
    points: -30,
    category: "malus",
    description: "Mandare un messaggio compromettente o all'ex dopo le 02:00 di notte.",
    type: "malus"
  }
];

const CATEGORIES = {
  all: { label: "Tutte le Regole", icon: "📋" },
  flirt: { label: "Flirt & Approcci", icon: "💬" },
  spicy: { label: "Spicy & Intimità", icon: "🌶️" },
  location: { label: "Location Insolite", icon: "📍" },
  goliardia: { label: "Goliardia & Social", icon: "🎉" },
  malus: { label: "Malus & Cringe", icon: "🤡" },
  custom: { label: "Regole Personalizzate", icon: "✨" }
};
