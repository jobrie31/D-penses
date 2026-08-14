import {
  useMemo,
} from "react";

import {
  occurrencesEntre,
} from "./depensesUtils";

function Recapitulatif({
  depenses,
}) {
  /*
   * ==============================
   * OUTILS
   * ==============================
   */

  const argent = (
    montant
  ) =>
    Number(
      montant || 0
    ).toLocaleString(
      "fr-CA",
      {
        style: "currency",
        currency: "CAD",
      }
    );

  const normaliserCategorie = (
    categorie
  ) => {
    if (
      categorie ===
      "Transport"
    ) {
      return "Gaz";
    }

    return (
      categorie || "Autre"
    );
  };

  const couleurCategorie = (
    categorie
  ) => {
    const nom =
      normaliserCategorie(
        categorie
      );

    const couleurs = {
      Épicerie: "#16a34a",
      Restaurant: "#f97316",
      Gaz: "#2563eb",
      Auto: "#475569",
      Logement: "#9333ea",
      Abonnements: "#4f46e5",
      Loisirs: "#db2777",
      Vêtements: "#0891b2",
      Santé: "#dc2626",
      Voyage: "#0d9488",
      Cadeau: "#eab308",
      Achat: "#a16207",
      Autre: "#94a3b8",
    };

    return (
      couleurs[nom] ||
      couleurs.Autre
    );
  };

  const dateDepuisTexte = (
    dateTexte
  ) => {
    if (!dateTexte) {
      return null;
    }

    const [
      annee,
      mois,
      jour,
    ] = dateTexte
      .split("-")
      .map(Number);

    return new Date(
      annee,
      mois - 1,
      jour,
      12
    );
  };

  const texteDepuisDate = (
    date
  ) => {
    const annee =
      date.getFullYear();

    const mois =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const jour =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${annee}-${mois}-${jour}`;
  };

  const formatDateCourte = (
    dateTexte
  ) => {
    const date =
      dateDepuisTexte(
        dateTexte
      );

    if (!date) {
      return "";
    }

    return date.toLocaleDateString(
      "fr-CA",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  /*
   * Retourne le dimanche
   * qui commence la semaine.
   */

  const debutSemaine = (
    dateTexte
  ) => {
    const date =
      dateDepuisTexte(
        dateTexte
      );

    if (!date) {
      return null;
    }

    const jourSemaine =
      date.getDay();

    date.setDate(
      date.getDate() -
        jourSemaine
    );

    return date;
  };

  const maintenant =
    new Date();

  maintenant.setHours(
    12,
    0,
    0,
    0
  );

  /*
   * ==============================
   * MOIS ACTUEL
   * ==============================
   */

  const debutMoisActuel =
    new Date(
      maintenant.getFullYear(),
      maintenant.getMonth(),
      1,
      12
    );

  const finMoisActuel =
    new Date(
      maintenant.getFullYear(),
      maintenant.getMonth() + 1,
      0,
      12
    );

  const occurrencesMois =
    useMemo(
      () =>
        occurrencesEntre(
          depenses,
          debutMoisActuel,
          finMoisActuel
        ),
      [
        depenses,
        maintenant.getFullYear(),
        maintenant.getMonth(),
      ]
    );

  /*
   * ==============================
   * ANNÉE ACTUELLE
   * ==============================
   */

  const debutAnnee =
    new Date(
      maintenant.getFullYear(),
      0,
      1,
      12
    );

  const finAnnee =
    new Date(
      maintenant.getFullYear(),
      11,
      31,
      12
    );

  const occurrencesAnnee =
    useMemo(
      () =>
        occurrencesEntre(
          depenses,
          debutAnnee,
          finAnnee
        ),
      [
        depenses,
        maintenant.getFullYear(),
      ]
    );

  /*
   * ==============================
   * CATÉGORIES ANNÉE
   * ==============================
   */

  const categoriesAnnee = {};

  occurrencesAnnee.forEach(
    (depense) => {
      const categorie =
        normaliserCategorie(
          depense.categorie
        );

      categoriesAnnee[
        categorie
      ] =
        (categoriesAnnee[
          categorie
        ] || 0) +
        Number(
          depense.montant ||
            0
        );
    }
  );

  const listeCategoriesAnnee =
    Object.entries(
      categoriesAnnee
    )
      .map(
        ([
          nom,
          montant,
        ]) => ({
          nom,
          montant,
        })
      )
      .sort(
        (a, b) =>
          b.montant -
          a.montant
      );

  const totalAnnee =
    occurrencesAnnee.reduce(
      (
        somme,
        depense
      ) =>
        somme +
        Number(
          depense.montant ||
            0
        ),
      0
    );

  /*
   * ==============================
   * TOP 10
   * ==============================
   */

  const top10Mois =
    [...occurrencesMois]
      .sort(
        (a, b) =>
          Number(
            b.montant || 0
          ) -
          Number(
            a.montant || 0
          )
      )
      .slice(0, 10);

  const top10Annee =
    [...occurrencesAnnee]
      .sort(
        (a, b) =>
          Number(
            b.montant || 0
          ) -
          Number(
            a.montant || 0
          )
      )
      .slice(0, 10);

  /*
   * ==============================
   * HISTORIQUE
   * ==============================
   *
   * Tout commence :
   * 1er avril 2026
   */

  const debutHistorique =
    new Date(
      2026,
      3,
      1,
      12
    );

  /*
   * Pour les totaux des périodes,
   * on inclut le mois actuel
   * au complet.
   */

  const finHistorique =
    finMoisActuel;

  const occurrencesHistorique =
    useMemo(
      () =>
        occurrencesEntre(
          depenses,
          debutHistorique,
          finHistorique
        ),
      [
        depenses,
        maintenant.getFullYear(),
        maintenant.getMonth(),
      ]
    );

  /*
   * Pour les moyennes :
   * seulement les mois
   * complètement terminés.
   */

  const finDernierMoisComplet =
    new Date(
      maintenant.getFullYear(),
      maintenant.getMonth(),
      0,
      12
    );

  const occurrencesMoisComplets =
    useMemo(
      () =>
        occurrencesEntre(
          depenses,
          debutHistorique,
          finDernierMoisComplet
        ),
      [
        depenses,
        maintenant.getFullYear(),
        maintenant.getMonth(),
      ]
    );

  /*
   * ==============================
   * PÉRIODE D'UNE DATE
   * ==============================
   */

  const obtenirPeriode =
    (dateTexte) => {
      if (!dateTexte) {
        return "Hiver";
      }

      const mois =
        Number(
          dateTexte.slice(
            5,
            7
          )
        );

      /*
       * MAI À AOÛT
       */

      if (
        mois >= 5 &&
        mois <= 8
      ) {
        return "Été";
      }

      /*
       * SEPTEMBRE À NOVEMBRE
       */

      if (
        mois >= 9 &&
        mois <= 11
      ) {
        return "Chasse";
      }

      /*
       * DÉCEMBRE À AVRIL
       */

      return "Hiver";
    };

  /*
   * ==============================
   * MOIS TERMINÉS
   * ==============================
   */

  const moisComplets =
    useMemo(() => {
      const liste = [];

      let date =
        new Date(
          2026,
          3,
          1,
          12
        );

      const debutMoisCourant =
        new Date(
          maintenant.getFullYear(),
          maintenant.getMonth(),
          1,
          12
        );

      while (
        date <
        debutMoisCourant
      ) {
        const annee =
          date.getFullYear();

        const mois =
          date.getMonth();

        const dateTexte =
          `${annee}-${String(
            mois + 1
          ).padStart(
            2,
            "0"
          )}-01`;

        liste.push({
          annee,
          mois,

          periode:
            obtenirPeriode(
              dateTexte
            ),
        });

        date =
          new Date(
            annee,
            mois + 1,
            1,
            12
          );
      }

      return liste;
    }, [
      maintenant.getFullYear(),
      maintenant.getMonth(),
    ]);

  /*
   * ==============================
   * CRÉER UNE PÉRIODE
   * ==============================
   */

  const creerPeriode = (
    nom
  ) => {
    /*
     * Toutes les dépenses de
     * cette période.
     */

    const occurrences =
      occurrencesHistorique.filter(
        (depense) =>
          obtenirPeriode(
            depense.dateOccurrence
          ) === nom
      );

    /*
     * Seulement mois terminés
     * pour calculer les moyennes.
     */

    const occurrencesCompletes =
      occurrencesMoisComplets.filter(
        (depense) =>
          obtenirPeriode(
            depense.dateOccurrence
          ) === nom
      );

    const moisTermines =
      moisComplets.filter(
        (item) =>
          item.periode === nom
      );

    /*
     * TOTAL
     */

    const total =
      occurrences.reduce(
        (
          somme,
          depense
        ) =>
          somme +
          Number(
            depense.montant ||
              0
          ),
        0
      );

    /*
     * TOTAL DES MOIS COMPLETS
     */

    const totalComplet =
      occurrencesCompletes.reduce(
        (
          somme,
          depense
        ) =>
          somme +
          Number(
            depense.montant ||
              0
          ),
        0
      );

    /*
     * MOYENNE / MOIS
     */

    const moyenneMois =
      moisTermines.length >
      0
        ? totalComplet /
          moisTermines.length
        : null;

    /*
     * NOMBRE RÉEL DE JOURS
     */

    let joursComplets = 0;

    moisTermines.forEach(
      ({
        annee,
        mois,
      }) => {
        joursComplets +=
          new Date(
            annee,
            mois + 1,
            0
          ).getDate();
      }
    );

    /*
     * MOYENNE / SEMAINE
     */

    const moyenneSemaine =
      joursComplets > 0
        ? totalComplet /
          (
            joursComplets /
            7
          )
        : null;

    /*
     * ==========================
     * CATÉGORIES DE LA PÉRIODE
     * ==========================
     */

    const categories = {};

    occurrences.forEach(
      (depense) => {
        const categorie =
          normaliserCategorie(
            depense.categorie
          );

        categories[
          categorie
        ] =
          (categories[
            categorie
          ] || 0) +
          Number(
            depense.montant ||
              0
          );
      }
    );

    const listeCategories =
      Object.entries(
        categories
      )
        .map(
          ([
            categorie,
            montant,
          ]) => ({
            categorie,
            montant,
          })
        )
        .sort(
          (a, b) =>
            b.montant -
            a.montant
        );

    /*
     * ==========================
     * TOP 5 PLUS GROS ACHATS
     * ==========================
     */

    const top5 =
      [...occurrences]
        .sort(
          (a, b) =>
            Number(
              b.montant || 0
            ) -
            Number(
              a.montant || 0
            )
        )
        .slice(
          0,
          5
        );

    /*
     * ==========================
     * PIRE SEMAINE
     * ==========================
     *
     * Dimanche -> samedi.
     */

    const semaines = {};

    occurrences.forEach(
      (depense) => {
        const dimanche =
          debutSemaine(
            depense.dateOccurrence
          );

        if (!dimanche) {
          return;
        }

        const cle =
          texteDepuisDate(
            dimanche
          );

        if (
          !semaines[cle]
        ) {
          semaines[cle] = {
            debut: cle,

            total: 0,

            achats: 0,
          };
        }

        semaines[cle].total +=
          Number(
            depense.montant ||
              0
          );

        semaines[cle].achats +=
          1;
      }
    );

    const listeSemaines =
      Object.values(
        semaines
      ).sort(
        (a, b) =>
          b.total -
          a.total
      );

    const pireSemaine =
      listeSemaines[0]
        ? {
            ...listeSemaines[0],

            fin: (() => {
              const date =
                dateDepuisTexte(
                  listeSemaines[0]
                    .debut
                );

              date.setDate(
                date.getDate() +
                  6
              );

              return texteDepuisDate(
                date
              );
            })(),
          }
        : null;

    return {
      nom,

      total,

      nombreAchats:
        occurrences.length,

      nombreMois:
        moisTermines.length,

      moyenneMois,

      moyenneSemaine,

      categories:
        listeCategories,

      top5,

      pireSemaine,
    };
  };

  const periodes = [
    creerPeriode(
      "Été"
    ),

    creerPeriode(
      "Chasse"
    ),

    creerPeriode(
      "Hiver"
    ),
  ];

  const descriptions = {
    Été:
      "Mai • Juin • Juillet • Août",

    Chasse:
      "Septembre • Octobre • Novembre",

    Hiver:
      "Décembre • Janvier • Février • Mars • Avril",
  };

  return (
    <>
      <style>{`
        .recap {
          width: 100%;

          padding-bottom: 30px;
        }

        .recap-entete {
          margin-bottom: 14px;
        }

        .recap-entete h2 {
          margin:
            0 0 3px;

          color: #182230;

          font-size:
            clamp(
              20px,
              1.5vw,
              28px
            );
        }

        .recap-entete p {
          margin: 0;

          color: #7b8490;

          font-size: 11px;
        }

        /*
         * ==========================
         * TITRES
         * ==========================
         */

        .recap-groupe {
          margin-top: 20px;
        }

        .recap-groupe:first-of-type {
          margin-top: 0;
        }

        .recap-groupe-entete {
          display: flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap: 10px;

          margin-bottom: 9px;
        }

        .recap-groupe-entete h3 {
          margin: 0;

          color: #182230;

          font-size:
            clamp(
              14px,
              1vw,
              18px
            );
        }

        .recap-groupe-entete span {
          color: #98a2b3;

          font-size: 9px;
        }

        /*
         * ==========================
         * PÉRIODES
         * ==========================
         */

        .recap-periodes {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap:
            clamp(
              10px,
              1vw,
              15px
            );
        }

        .recap-periode {
          min-width: 0;

          background: white;

          border:
            1px solid #e1e5e9;

          border-radius: 12px;

          overflow: hidden;
        }

        .recap-periode-haut {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 8px;

          padding:
            13px 14px;

          border-bottom:
            1px solid #edf0f2;
        }

        .recap-periode-haut h4 {
          margin: 0;

          color: #182230;

          font-size:
            clamp(
              16px,
              1.15vw,
              21px
            );
        }

        .recap-periode-description {
          margin-top: 3px;

          color: #98a2b3;

          font-size: 8px;
        }

        .recap-periode-badge {
          flex-shrink: 0;

          padding:
            3px 6px;

          border-radius: 20px;

          background: #f2f4f7;

          color: #667085;

          font-size: 8px;

          font-weight: 700;
        }

        .recap-periode-contenu {
          padding:
            11px 12px 13px;
        }

        /*
         * TOTAL
         */

        .recap-periode-total {
          margin-bottom: 8px;

          padding: 11px;

          border-radius: 8px;

          background: #f5f7f9;
        }

        .recap-periode-total-label {
          margin-bottom: 3px;

          color: #667085;

          font-size: 8px;
        }

        .recap-periode-total-valeur {
          color: #182230;

          font-size:
            clamp(
              20px,
              1.5vw,
              28px
            );

          font-weight: 800;

          letter-spacing:
            -0.6px;
        }

        /*
         * STATS
         */

        .recap-periode-stats {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 5px;
        }

        .recap-periode-stat {
          min-width: 0;

          padding: 8px;

          border:
            1px solid #eaecf0;

          border-radius: 7px;
        }

        .recap-periode-stat-label {
          margin-bottom: 3px;

          color: #7c8591;

          font-size: 7px;
        }

        .recap-periode-stat-valeur {
          overflow: hidden;

          color: #182230;

          font-size:
            clamp(
              10px,
              0.75vw,
              13px
            );

          font-weight: 750;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        /*
         * SOUS-SECTIONS DES PÉRIODES
         */

        .periode-section {
          margin-top: 13px;

          padding-top: 11px;

          border-top:
            1px solid #edf0f2;
        }

        .periode-section-titre {
          margin-bottom: 7px;

          color: #667085;

          font-size: 8px;

          font-weight: 750;

          text-transform:
            uppercase;

          letter-spacing:
            0.4px;
        }

        /*
         * PIRE SEMAINE
         */

        .pire-semaine {
          padding: 10px;

          border:
            1px solid #f0d6d6;

          border-radius: 8px;

          background: #fff8f8;
        }

        .pire-semaine-haut {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;
        }

        .pire-semaine-date {
          color: #667085;

          font-size: 8px;
        }

        .pire-semaine-montant {
          color: #b42318;

          font-size:
            clamp(
              14px,
              1vw,
              17px
            );

          font-weight: 800;
        }

        .pire-semaine-bas {
          margin-top: 3px;

          color: #98a2b3;

          font-size: 7px;
        }

        /*
         * CATÉGORIES
         */

        .periode-categorie {
          margin-bottom: 8px;
        }

        .periode-categorie:last-child {
          margin-bottom: 0;
        }

        .periode-categorie-ligne {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 7px;

          margin-bottom: 4px;

          color: #344054;

          font-size:
            clamp(
              9px,
              0.66vw,
              11px
            );
        }

        .periode-categorie-nom {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 6px;
        }

        .recap-point {
          flex-shrink: 0;

          width: 8px;

          height: 8px;

          border-radius: 50%;
        }

        .periode-categorie-texte {
          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        .periode-categorie-ligne strong {
          flex-shrink: 0;
        }

        .recap-barre {
          height: 4px;

          overflow: hidden;

          border-radius: 20px;

          background: #eef1f4;
        }

        .recap-barre-remplie {
          height: 100%;

          border-radius: 20px;
        }

        /*
         * TOP 5 PÉRIODE
         */

        .periode-top-ligne {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 7px;

          padding:
            6px 1px;

          border-bottom:
            1px solid #f1f3f5;
        }

        .periode-top-ligne:last-child {
          border-bottom: 0;
        }

        .periode-top-gauche {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 6px;
        }

        .periode-top-position {
          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          width: 17px;

          height: 17px;

          border-radius: 5px;

          background: #f2f4f7;

          color: #667085;

          font-size: 7px;

          font-weight: 800;
        }

        .periode-top-info {
          min-width: 0;
        }

        .periode-top-nom {
          overflow: hidden;

          color: #344054;

          font-size:
            clamp(
              9px,
              0.65vw,
              11px
            );

          font-weight: 680;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        .periode-top-detail {
          display: flex;

          align-items: center;

          gap: 4px;

          margin-top: 1px;

          color: #98a2b3;

          font-size: 7px;
        }

        .periode-top-montant {
          flex-shrink: 0;

          color: #182230;

          font-size:
            clamp(
              9px,
              0.68vw,
              11px
            );

          font-weight: 780;
        }

        /*
         * ==========================
         * ANCIEN RÉCAP
         * ==========================
         */

        .recap-principal-grid {
          display: grid;

          grid-template-columns:
            minmax(
              250px,
              0.8fr
            )
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            clamp(
              8px,
              0.8vw,
              13px
            );
        }

        .recap-card {
          min-width: 0;

          background: white;

          border:
            1px solid #e1e5e9;

          border-radius: 11px;

          overflow: hidden;
        }

        .recap-card-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;

          padding:
            11px 13px;

          border-bottom:
            1px solid #edf0f2;
        }

        .recap-card-header h4 {
          margin: 0;

          color: #182230;

          font-size:
            clamp(
              12px,
              0.9vw,
              15px
            );
        }

        .recap-card-header span {
          color: #98a2b3;

          font-size: 8px;
        }

        .recap-card-contenu {
          padding:
            10px 12px;
        }

        /*
         * CATÉGORIES ANNUELLES
         */

        .recap-categorie {
          margin-bottom: 9px;
        }

        .recap-categorie:last-child {
          margin-bottom: 0;
        }

        .recap-categorie-ligne {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;

          margin-bottom: 4px;

          color: #344054;

          font-size:
            clamp(
              9px,
              0.68vw,
              11px
            );
        }

        .recap-categorie-nom {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 6px;
        }

        .recap-categorie-texte {
          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        /*
         * TOP 10
         */

        .recap-top-ligne {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 7px;

          min-height: 36px;

          padding:
            6px 1px;

          border-bottom:
            1px solid #f1f3f5;
        }

        .recap-top-ligne:last-child {
          border-bottom: 0;
        }

        .recap-top-gauche {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 7px;
        }

        .recap-top-position {
          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          width: 18px;

          height: 18px;

          border-radius: 5px;

          background: #f2f4f7;

          color: #667085;

          font-size: 7px;

          font-weight: 800;
        }

        .recap-top-info {
          min-width: 0;
        }

        .recap-top-nom {
          overflow: hidden;

          color: #344054;

          font-size:
            clamp(
              9px,
              0.68vw,
              11px
            );

          font-weight: 680;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        .recap-top-bas {
          display: flex;

          align-items: center;

          gap: 4px;

          margin-top: 2px;

          color: #98a2b3;

          font-size: 7px;
        }

        .recap-top-mini-point {
          width: 5px;

          height: 5px;

          border-radius: 50%;

          flex-shrink: 0;
        }

        .recap-top-montant {
          flex-shrink: 0;

          color: #182230;

          font-size:
            clamp(
              9px,
              0.7vw,
              12px
            );

          font-weight: 780;
        }

        .recap-vide {
          padding: 12px 3px;

          color: #98a2b3;

          text-align: center;

          font-size: 9px;
        }

        /*
         * ==========================
         * RESPONSIVE
         * ==========================
         */

        @media (
          max-width: 1200px
        ) {
          .recap-periodes {
            grid-template-columns:
              1fr;
          }

          .recap-periode-contenu {
            display: grid;

            grid-template-columns:
              minmax(
                230px,
                0.75fr
              )
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 12px;
          }

          .periode-section {
            margin-top: 0;

            padding-top: 0;

            padding-left: 12px;

            border-top: 0;

            border-left:
              1px solid #edf0f2;
          }
        }

        @media (
          max-width: 900px
        ) {
          .recap-periode-contenu {
            grid-template-columns:
              1fr 1fr;
          }

          .periode-section {
            margin-top: 13px;

            padding-top: 11px;

            padding-left: 0;

            border-left: 0;

            border-top:
              1px solid #edf0f2;
          }

          .recap-principal-grid {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 600px
        ) {
          .recap-periode-contenu {
            display: block;
          }

          .recap-periode-stats {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }
        }

        @media (
          max-width: 430px
        ) {
          .recap-periode-stats {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>

      <div className="recap">
        <div className="recap-entete">
          <h2>
            Récapitulatif
          </h2>

          <p>
            Analyse de tes dépenses et de tes habitudes depuis avril 2026.
          </p>
        </div>

        {/* =========================
            PÉRIODES DE L'ANNÉE
        ========================== */}

        <section className="recap-groupe">
          <div className="recap-groupe-entete">
            <h3>
              Périodes de l'année
            </h3>

            <span>
              Moyennes calculées sur les mois terminés
            </span>
          </div>

          <div className="recap-periodes">
            {periodes.map(
              (periode) => (
                <div
                  className="recap-periode"
                  key={
                    periode.nom
                  }
                >
                  <div className="recap-periode-haut">
                    <div>
                      <h4>
                        {
                          periode.nom
                        }
                      </h4>

                      <div className="recap-periode-description">
                        {
                          descriptions[
                            periode.nom
                          ]
                        }
                      </div>
                    </div>

                    <span className="recap-periode-badge">
                      {
                        periode.nombreMois
                      }{" "}
                      mois terminé
                      {periode.nombreMois !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="recap-periode-contenu">
                    {/* RÉSUMÉ */}

                    <div>
                      <div className="recap-periode-total">
                        <div className="recap-periode-total-label">
                          Dépenses
                        </div>

                        <div className="recap-periode-total-valeur">
                          {argent(
                            periode.total
                          )}
                        </div>
                      </div>

                      <div className="recap-periode-stats">
                        <div className="recap-periode-stat">
                          <div className="recap-periode-stat-label">
                            Moy. / mois
                          </div>

                          <div className="recap-periode-stat-valeur">
                            {periode.moyenneMois ===
                            null
                              ? "—"
                              : argent(
                                  periode.moyenneMois
                                )}
                          </div>
                        </div>

                        <div className="recap-periode-stat">
                          <div className="recap-periode-stat-label">
                            Moy. / semaine
                          </div>

                          <div className="recap-periode-stat-valeur">
                            {periode.moyenneSemaine ===
                            null
                              ? "—"
                              : argent(
                                  periode.moyenneSemaine
                                )}
                          </div>
                        </div>

                        <div className="recap-periode-stat">
                          <div className="recap-periode-stat-label">
                            Achats
                          </div>

                          <div className="recap-periode-stat-valeur">
                            {
                              periode.nombreAchats
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CATÉGORIES */}

                    <div className="periode-section">
                      <div className="periode-section-titre">
                        Catégories
                      </div>

                      {periode.categories.length ===
                      0 ? (
                        <div className="recap-vide">
                          Aucune dépense
                        </div>
                      ) : (
                        periode.categories.map(
                          (
                            categorie
                          ) => {
                            const pourcentage =
                              periode.total >
                              0
                                ? (categorie.montant /
                                    periode.total) *
                                  100
                                : 0;

                            const couleur =
                              couleurCategorie(
                                categorie.categorie
                              );

                            return (
                              <div
                                className="periode-categorie"
                                key={
                                  categorie.categorie
                                }
                              >
                                <div className="periode-categorie-ligne">
                                  <div className="periode-categorie-nom">
                                    <span
                                      className="recap-point"
                                      style={{
                                        backgroundColor:
                                          couleur,
                                      }}
                                    />

                                    <span className="periode-categorie-texte">
                                      {
                                        categorie.categorie
                                      }
                                    </span>
                                  </div>

                                  <strong>
                                    {argent(
                                      categorie.montant
                                    )}
                                  </strong>
                                </div>

                                <div className="recap-barre">
                                  <div
                                    className="recap-barre-remplie"
                                    style={{
                                      width: `${pourcentage}%`,
                                      backgroundColor:
                                        couleur,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>

                    {/* TOP 5 */}

                    <div className="periode-section">
                      <div className="periode-section-titre">
                        Top 5 plus grosses dépenses
                      </div>

                      {periode.top5.length ===
                      0 ? (
                        <div className="recap-vide">
                          Aucune dépense
                        </div>
                      ) : (
                        periode.top5.map(
                          (
                            depense,
                            index
                          ) => (
                            <div
                              className="periode-top-ligne"
                              key={`${depense.id}-${depense.dateOccurrence}-${index}`}
                            >
                              <div className="periode-top-gauche">
                                <div className="periode-top-position">
                                  {index +
                                    1}
                                </div>

                                <span
                                  className="recap-point"
                                  style={{
                                    backgroundColor:
                                      couleurCategorie(
                                        depense.categorie
                                      ),
                                  }}
                                />

                                <div className="periode-top-info">
                                  <div className="periode-top-nom">
                                    {
                                      depense.nom
                                    }
                                  </div>

                                  <div className="periode-top-detail">
                                    <span>
                                      {normaliserCategorie(
                                        depense.categorie
                                      )}
                                    </span>

                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {formatDateCourte(
                                        depense.dateOccurrence
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="periode-top-montant">
                                {argent(
                                  depense.montant
                                )}
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>

                    {/* PIRE SEMAINE */}

                    <div className="periode-section">
                      <div className="periode-section-titre">
                        Pire semaine
                      </div>

                      {periode.pireSemaine ? (
                        <div className="pire-semaine">
                          <div className="pire-semaine-haut">
                            <div className="pire-semaine-date">
                              {formatDateCourte(
                                periode
                                  .pireSemaine
                                  .debut
                              )}{" "}
                              au{" "}
                              {formatDateCourte(
                                periode
                                  .pireSemaine
                                  .fin
                              )}
                            </div>

                            <div className="pire-semaine-montant">
                              {argent(
                                periode
                                  .pireSemaine
                                  .total
                              )}
                            </div>
                          </div>

                          <div className="pire-semaine-bas">
                            {
                              periode
                                .pireSemaine
                                .achats
                            }{" "}
                            achat
                            {periode
                              .pireSemaine
                              .achats !==
                            1
                              ? "s"
                              : ""}{" "}
                            cette semaine
                          </div>
                        </div>
                      ) : (
                        <div className="recap-vide">
                          Aucune dépense
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =========================
            DÉTAILS QUI ÉTAIENT DÉJÀ LÀ
        ========================== */}

        <section className="recap-groupe">
          <div className="recap-groupe-entete">
            <h3>
              Détails
            </h3>

            <span>
              {
                maintenant.getFullYear()
              }
            </span>
          </div>

          <div className="recap-principal-grid">
            {/* CATÉGORIES ANNÉE */}

            <div className="recap-card">
              <div className="recap-card-header">
                <h4>
                  Dépenses par catégorie
                </h4>

                <span>
                  Année{" "}
                  {
                    maintenant.getFullYear()
                  }
                </span>
              </div>

              <div className="recap-card-contenu">
                {listeCategoriesAnnee.length ===
                0 ? (
                  <div className="recap-vide">
                    Aucune dépense
                  </div>
                ) : (
                  listeCategoriesAnnee.map(
                    (
                      categorie
                    ) => {
                      const pourcentage =
                        totalAnnee >
                        0
                          ? (categorie.montant /
                              totalAnnee) *
                            100
                          : 0;

                      const couleur =
                        couleurCategorie(
                          categorie.nom
                        );

                      return (
                        <div
                          className="recap-categorie"
                          key={
                            categorie.nom
                          }
                        >
                          <div className="recap-categorie-ligne">
                            <div className="recap-categorie-nom">
                              <span
                                className="recap-point"
                                style={{
                                  backgroundColor:
                                    couleur,
                                }}
                              />

                              <span className="recap-categorie-texte">
                                {
                                  categorie.nom
                                }
                              </span>
                            </div>

                            <strong>
                              {argent(
                                categorie.montant
                              )}
                            </strong>
                          </div>

                          <div className="recap-barre">
                            <div
                              className="recap-barre-remplie"
                              style={{
                                width: `${pourcentage}%`,
                                backgroundColor:
                                  couleur,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>

            {/* TOP 10 MOIS */}

            <div className="recap-card">
              <div className="recap-card-header">
                <h4>
                  Top 10 du mois
                </h4>

                <span>
                  {
                    occurrencesMois.length
                  }{" "}
                  achats
                </span>
              </div>

              <div className="recap-card-contenu">
                {top10Mois.length ===
                0 ? (
                  <div className="recap-vide">
                    Aucune dépense
                  </div>
                ) : (
                  top10Mois.map(
                    (
                      depense,
                      index
                    ) => (
                      <div
                        className="recap-top-ligne"
                        key={`${depense.id}-${depense.dateOccurrence}-${index}`}
                      >
                        <div className="recap-top-gauche">
                          <div className="recap-top-position">
                            {index +
                              1}
                          </div>

                          <div className="recap-top-info">
                            <div className="recap-top-nom">
                              {
                                depense.nom
                              }
                            </div>

                            <div className="recap-top-bas">
                              <span
                                className="recap-top-mini-point"
                                style={{
                                  backgroundColor:
                                    couleurCategorie(
                                      depense.categorie
                                    ),
                                }}
                              />

                              <span>
                                {normaliserCategorie(
                                  depense.categorie
                                )}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatDateCourte(
                                  depense.dateOccurrence
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="recap-top-montant">
                          {argent(
                            depense.montant
                          )}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* TOP 10 ANNÉE */}

            <div className="recap-card">
              <div className="recap-card-header">
                <h4>
                  Top 10 de l'année
                </h4>

                <span>
                  {
                    maintenant.getFullYear()
                  }
                </span>
              </div>

              <div className="recap-card-contenu">
                {top10Annee.length ===
                0 ? (
                  <div className="recap-vide">
                    Aucune dépense
                  </div>
                ) : (
                  top10Annee.map(
                    (
                      depense,
                      index
                    ) => (
                      <div
                        className="recap-top-ligne"
                        key={`${depense.id}-${depense.dateOccurrence}-${index}`}
                      >
                        <div className="recap-top-gauche">
                          <div className="recap-top-position">
                            {index +
                              1}
                          </div>

                          <div className="recap-top-info">
                            <div className="recap-top-nom">
                              {
                                depense.nom
                              }
                            </div>

                            <div className="recap-top-bas">
                              <span
                                className="recap-top-mini-point"
                                style={{
                                  backgroundColor:
                                    couleurCategorie(
                                      depense.categorie
                                    ),
                                }}
                              />

                              <span>
                                {normaliserCategorie(
                                  depense.categorie
                                )}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatDateCourte(
                                  depense.dateOccurrence
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="recap-top-montant">
                          {argent(
                            depense.montant
                          )}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Recapitulatif;