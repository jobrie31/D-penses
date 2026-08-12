export function dateDepuisString(
  dateString
) {
  if (!dateString) {
    return null;
  }

  const [
    annee,
    mois,
    jour,
  ] = dateString
    .split("-")
    .map(Number);

  return new Date(
    annee,
    mois - 1,
    jour,
    12,
    0,
    0,
    0
  );
}

export function stringDepuisDate(
  date
) {
  const annee =
    date.getFullYear();

  const mois = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const jour = String(
    date.getDate()
  ).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

function joursDansMois(
  annee,
  mois
) {
  return new Date(
    annee,
    mois + 1,
    0
  ).getDate();
}

/*
 * Permet par exemple :
 *
 * 31 janvier
 * -> 28 février
 * -> 31 mars
 * -> 30 avril
 *
 * sans décaler toute la série.
 */

function ajouterMoisAncre(
  dateOriginale,
  nombreMois
) {
  const jourOriginal =
    dateOriginale.getDate();

  const cible = new Date(
    dateOriginale.getFullYear(),
    dateOriginale.getMonth() +
      nombreMois,
    1,
    12
  );

  const jour = Math.min(
    jourOriginal,
    joursDansMois(
      cible.getFullYear(),
      cible.getMonth()
    )
  );

  cible.setDate(jour);

  return cible;
}

/*
 * Gestion correcte du
 * 29 février.
 */

function ajouterAnneesAncre(
  dateOriginale,
  nombreAnnees
) {
  const annee =
    dateOriginale.getFullYear() +
    nombreAnnees;

  const mois =
    dateOriginale.getMonth();

  const jour = Math.min(
    dateOriginale.getDate(),
    joursDansMois(
      annee,
      mois
    )
  );

  return new Date(
    annee,
    mois,
    jour,
    12
  );
}

export function genererOccurrences(
  depense,
  dateDebutPeriode,
  dateFinPeriode
) {
  if (!depense?.date) {
    return [];
  }

  const debutDepense =
    dateDepuisString(
      depense.date
    );

  const debutPeriode =
    typeof dateDebutPeriode ===
    "string"
      ? dateDepuisString(
          dateDebutPeriode
        )
      : dateDebutPeriode;

  const finPeriode =
    typeof dateFinPeriode ===
    "string"
      ? dateDepuisString(
          dateFinPeriode
        )
      : dateFinPeriode;

  if (
    !debutDepense ||
    !debutPeriode ||
    !finPeriode
  ) {
    return [];
  }

  /*
   * Date de fin OPTIONNELLE.
   *
   * null = aucune date de fin.
   */

  const finRecurrence =
    depense.dateFinRecurrence
      ? dateDepuisString(
          depense.dateFinRecurrence
        )
      : null;

  /*
   * S'il n'y a aucune date de fin,
   * on génère simplement jusqu'à
   * la fin de la période demandée.
   *
   * Par exemple :
   * seulement le mois affiché.
   */

  const vraieFin =
    finRecurrence
      ? new Date(
          Math.min(
            finPeriode.getTime(),
            finRecurrence.getTime()
          )
        )
      : finPeriode;

  if (
    debutDepense >
    vraieFin
  ) {
    return [];
  }

  /*
   * ==============================
   * UNIQUE
   * ==============================
   */

  if (
    !depense.recurrence ||
    depense.recurrence ===
      "unique"
  ) {
    if (
      debutDepense >=
        debutPeriode &&
      debutDepense <=
        vraieFin
    ) {
      return [
        {
          ...depense,

          dateOccurrence:
            stringDepuisDate(
              debutDepense
            ),
        },
      ];
    }

    return [];
  }

  const occurrences = [];

  /*
   * ==============================
   * HEBDOMADAIRE /
   * AUX 2 SEMAINES
   * ==============================
   */

  if (
    depense.recurrence ===
      "hebdomadaire" ||
    depense.recurrence ===
      "bihebdomadaire"
  ) {
    const intervalle =
      depense.recurrence ===
      "hebdomadaire"
        ? 7
        : 14;

    let dateCourante =
      new Date(
        debutDepense
      );

    /*
     * Optimisation :
     *
     * Si la série existe depuis
     * longtemps, on saute directement
     * près de la période demandée.
     */

    if (
      dateCourante <
      debutPeriode
    ) {
      const differenceMs =
        debutPeriode.getTime() -
        dateCourante.getTime();

      const differenceJours =
        Math.floor(
          differenceMs /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      const sauts =
        Math.floor(
          differenceJours /
            intervalle
        );

      dateCourante.setDate(
        dateCourante.getDate() +
          sauts *
            intervalle
      );

      while (
        dateCourante <
        debutPeriode
      ) {
        dateCourante.setDate(
          dateCourante.getDate() +
            intervalle
        );
      }
    }

    while (
      dateCourante <=
      vraieFin
    ) {
      if (
        dateCourante >=
        debutPeriode
      ) {
        occurrences.push({
          ...depense,

          dateOccurrence:
            stringDepuisDate(
              dateCourante
            ),
        });
      }

      const prochaine =
        new Date(
          dateCourante
        );

      prochaine.setDate(
        prochaine.getDate() +
          intervalle
      );

      dateCourante =
        prochaine;
    }

    return occurrences;
  }

  /*
   * ==============================
   * MENSUEL
   * ==============================
   */

  if (
    depense.recurrence ===
    "mensuelle"
  ) {
    let index = 0;

    /*
     * On saute directement proche
     * du mois demandé.
     */

    if (
      debutDepense <
      debutPeriode
    ) {
      index =
        (
          debutPeriode.getFullYear() -
          debutDepense.getFullYear()
        ) *
          12 +
        (
          debutPeriode.getMonth() -
          debutDepense.getMonth()
        );

      if (index < 0) {
        index = 0;
      }

      /*
       * On recule d'un mois pour ne
       * jamais rater une occurrence
       * près de la frontière.
       */

      index = Math.max(
        0,
        index - 1
      );
    }

    while (true) {
      const dateCourante =
        ajouterMoisAncre(
          debutDepense,
          index
        );

      if (
        dateCourante >
        vraieFin
      ) {
        break;
      }

      if (
        dateCourante >=
        debutPeriode
      ) {
        occurrences.push({
          ...depense,

          dateOccurrence:
            stringDepuisDate(
              dateCourante
            ),
        });
      }

      index++;
    }

    return occurrences;
  }

  /*
   * ==============================
   * ANNUEL
   * ==============================
   */

  if (
    depense.recurrence ===
    "annuelle"
  ) {
    let index = 0;

    if (
      debutDepense <
      debutPeriode
    ) {
      index =
        debutPeriode.getFullYear() -
        debutDepense.getFullYear();

      index = Math.max(
        0,
        index - 1
      );
    }

    while (true) {
      const dateCourante =
        ajouterAnneesAncre(
          debutDepense,
          index
        );

      if (
        dateCourante >
        vraieFin
      ) {
        break;
      }

      if (
        dateCourante >=
        debutPeriode
      ) {
        occurrences.push({
          ...depense,

          dateOccurrence:
            stringDepuisDate(
              dateCourante
            ),
        });
      }

      index++;
    }

    return occurrences;
  }

  return [];
}

export function occurrencesEntre(
  depenses,
  debut,
  fin
) {
  return depenses.flatMap(
    (depense) =>
      genererOccurrences(
        depense,
        debut,
        fin
      )
  );
}