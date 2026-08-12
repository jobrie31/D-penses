import {
  useMemo,
} from "react";

import {
  occurrencesEntre,
} from "./depensesUtils";

function ResumeMois({
  depenses,
  moisAffiche,
  categorieSelectionnee,
  selectionnerCategorie,
}) {
  const mois =
    moisAffiche.getMonth();

  const annee =
    moisAffiche.getFullYear();

  const nomsMois = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

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

  /*
   * COULEURS DES CATÉGORIES
   */

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

  const argent = (montant) =>
    Number(
      montant || 0
    ).toLocaleString(
      "fr-CA",
      {
        style: "currency",
        currency: "CAD",
      }
    );

  /*
   * MOIS AFFICHÉ
   */

  const debutMois =
    new Date(
      annee,
      mois,
      1,
      12
    );

  const finMois =
    new Date(
      annee,
      mois + 1,
      0,
      12
    );

  const occurrencesMois =
    useMemo(
      () =>
        occurrencesEntre(
          depenses,
          debutMois,
          finMois
        ),
      [
        depenses,
        annee,
        mois,
      ]
    );

  const total =
    occurrencesMois.reduce(
      (
        somme,
        depense
      ) =>
        somme +
        Number(
          depense.montant || 0
        ),
      0
    );

  /*
   * AUJOURD'HUI
   */

  const aujourdHui =
    new Date();

  aujourdHui.setHours(
    12,
    0,
    0,
    0
  );

  /*
   * MOYENNE MENSUELLE
   *
   * Commence en juillet 2026.
   * Le mois actuel est exclu.
   */

  const debutHistorique =
    new Date(
      2026,
      6,
      1,
      12
    );

  const finDernierMoisComplet =
    new Date(
      aujourdHui.getFullYear(),
      aujourdHui.getMonth(),
      0,
      12
    );

  const indexJuillet2026 =
    2026 * 12 + 6;

  const indexMoisActuel =
    aujourdHui.getFullYear() *
      12 +
    aujourdHui.getMonth();

  const nombreMoisComplets =
    Math.max(
      0,
      indexMoisActuel -
        indexJuillet2026
    );

  const occurrencesHistorique =
    useMemo(() => {
      if (
        nombreMoisComplets <=
        0
      ) {
        return [];
      }

      return occurrencesEntre(
        depenses,
        debutHistorique,
        finDernierMoisComplet
      );
    }, [
      depenses,
      nombreMoisComplets,
      aujourdHui.getFullYear(),
      aujourdHui.getMonth(),
    ]);

  const totalHistorique =
    occurrencesHistorique.reduce(
      (
        somme,
        depense
      ) =>
        somme +
        Number(
          depense.montant || 0
        ),
      0
    );

  const moyenneMensuelle =
    nombreMoisComplets > 0
      ? totalHistorique /
        nombreMoisComplets
      : null;

  /*
   * MOYENNE PAR SEMAINE
   */

  const debutMoisActuel =
    new Date(
      aujourdHui.getFullYear(),
      aujourdHui.getMonth(),
      1,
      12
    );

  const estMoisActuel =
    annee ===
      aujourdHui.getFullYear() &&
    mois ===
      aujourdHui.getMonth();

  const estMoisPasse =
    debutMois <
    debutMoisActuel;

  const estMoisFutur =
    debutMois >
    debutMoisActuel;

  const nombreJoursDuMois =
    finMois.getDate();

  let dernierJourMoyenne =
    null;

  if (estMoisActuel) {
    dernierJourMoyenne =
      aujourdHui.getDate();
  } else if (
    estMoisPasse
  ) {
    dernierJourMoyenne =
      nombreJoursDuMois;
  }

  const finPeriodeMoyenne =
    dernierJourMoyenne
      ? new Date(
          annee,
          mois,
          dernierJourMoyenne,
          12
        )
      : null;

  const occurrencesPourMoyenne =
    useMemo(() => {
      if (
        !finPeriodeMoyenne
      ) {
        return [];
      }

      return occurrencesEntre(
        depenses,
        debutMois,
        finPeriodeMoyenne
      );
    }, [
      depenses,
      annee,
      mois,
      dernierJourMoyenne,
    ]);

  const totalPourMoyenne =
    occurrencesPourMoyenne.reduce(
      (
        somme,
        depense
      ) =>
        somme +
        Number(
          depense.montant || 0
        ),
      0
    );

  let moyenneSemaine =
    null;

  if (
    dernierJourMoyenne &&
    dernierJourMoyenne > 0
  ) {
    const semainesEcoulees =
      dernierJourMoyenne / 7;

    moyenneSemaine =
      totalPourMoyenne /
      semainesEcoulees;
  }

  /*
   * CATÉGORIES
   */

  const categories = {};

  occurrencesMois.forEach(
    (depense) => {
      const nom =
        normaliserCategorie(
          depense.categorie
        );

      categories[nom] =
        (categories[nom] ||
          0) +
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

  /*
   * MODES DE PAIEMENT
   */

  const paiements = {};

  occurrencesMois.forEach(
    (depense) => {
      const mode =
        depense.modePaiement ||
        "Non défini";

      paiements[mode] =
        (paiements[mode] ||
          0) +
        Number(
          depense.montant ||
            0
        );
    }
  );

  const listePaiements =
    Object.entries(
      paiements
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

  return (
    <>
      <style>{`
        .resume-mois {
          min-width: 0;
          min-height: 0;
          height: 100%;

          display: flex;
          flex-direction: column;

          background: white;

          border:
            1px solid #dfe4e9;

          border-radius: 10px;

          overflow: hidden;
        }

        .resume-mois-header {
          flex: 0 0 auto;

          padding:
            clamp(
              11px,
              1vw,
              16px
            );

          border-bottom:
            1px solid #e8ecf0;
        }

        .resume-mois-header span {
          display: block;

          color: #89919c;

          font-size:
            clamp(
              9px,
              0.6vw,
              11px
            );

          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            0.45px;

          margin-bottom: 3px;
        }

        .resume-mois-header h3 {
          margin: 0;

          font-size:
            clamp(
              16px,
              1.25vw,
              21px
            );
        }

        .resume-mois-contenu {
          flex: 1 1 0;
          min-height: 0;

          overflow-y: auto;

          padding:
            clamp(
              10px,
              1vw,
              15px
            );
        }

        .resume-grands-chiffres {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 7px;

          margin-bottom: 9px;
        }

        .resume-principal {
          min-width: 0;

          padding:
            clamp(
              11px,
              0.9vw,
              16px
            );

          border-radius: 9px;

          background: #f5f7f9;
        }

        .resume-principal-label {
          color: #667085;

          font-size:
            clamp(
              9px,
              0.6vw,
              11px
            );

          margin-bottom: 4px;
        }

        .resume-principal-montant {
          overflow: hidden;

          color: #182230;

          font-size:
            clamp(
              18px,
              1.4vw,
              26px
            );

          font-weight: 790;

          letter-spacing:
            -0.6px;

          white-space: nowrap;

          text-overflow:
            ellipsis;
        }

        .resume-principal-note {
          margin-top: 4px;

          color: #98a2b3;

          font-size:
            clamp(
              7px,
              0.45vw,
              9px
            );
        }

        .resume-stats {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 7px;

          margin-bottom: 12px;
        }

        .resume-stat {
          padding:
            clamp(
              9px,
              0.8vw,
              13px
            );

          border:
            1px solid #eaecf0;

          border-radius: 8px;

          background: white;
        }

        .resume-stat-label {
          color: #7c8591;

          font-size:
            clamp(
              9px,
              0.55vw,
              11px
            );

          margin-bottom: 4px;
        }

        .resume-stat-valeur {
          overflow: hidden;

          color: #182230;

          font-size:
            clamp(
              14px,
              1vw,
              18px
            );

          font-weight: 760;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        .resume-stat-note {
          margin-top: 3px;

          color: #98a2b3;

          font-size:
            clamp(
              7px,
              0.48vw,
              9px
            );
        }

        .resume-section {
          padding-top: 11px;

          margin-top: 11px;

          border-top:
            1px solid #edf0f2;
        }

        .resume-section-title {
          margin-bottom: 7px;

          color: #667085;

          font-size:
            clamp(
              9px,
              0.6vw,
              11px
            );

          font-weight: 750;

          text-transform:
            uppercase;

          letter-spacing:
            0.4px;
        }

        /*
         * CATÉGORIE
         */

        .resume-categorie {
          padding: 7px 8px;

          margin:
            0 -4px 3px;

          border:
            1px solid transparent;

          border-radius: 8px;

          cursor: pointer;

          transition:
            background 0.15s ease,
            border 0.15s ease,
            transform 0.15s ease;
        }

        .resume-categorie:hover {
          background: #f6f8fa;

          border-color:
            #e4e7ec;
        }

        .resume-categorie-active {
          background: #eef2f6;

          border-color:
            #cbd2da;

          transform:
            translateX(2px);
        }

        .resume-ligne {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 8px;

          color: #344054;

          font-size:
            clamp(
              10px,
              0.72vw,
              13px
            );
        }

        /*
         * NOM CATÉGORIE + POINT
         */

        .resume-categorie-nom {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 7px;
        }

        .categorie-point {
          width:
            clamp(
              8px,
              0.55vw,
              11px
            );

          height:
            clamp(
              8px,
              0.55vw,
              11px
            );

          flex-shrink: 0;

          border-radius: 50%;

          box-shadow:
            0 0 0 2px
            rgba(
              255,
              255,
              255,
              0.8
            );
        }

        .categorie-texte {
          min-width: 0;

          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        .resume-ligne strong {
          flex-shrink: 0;

          font-size:
            clamp(
              10px,
              0.72vw,
              13px
            );
        }

        .resume-barre {
          height:
            clamp(
              4px,
              0.35vw,
              6px
            );

          margin-top: 5px;

          overflow: hidden;

          border-radius: 20px;

          background: #eef1f4;
        }

        .resume-barre-remplie {
          height: 100%;

          border-radius: 20px;
        }

        .resume-filtre-actif {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 8px;

          padding: 8px 9px;

          margin-bottom: 10px;

          border-radius: 7px;

          background: #eef2f6;

          color: #344054;

          font-size: 10px;
        }

        .resume-filtre-nom {
          display: flex;

          align-items: center;

          gap: 6px;
        }

        .resume-filtre-actif button {
          border: 0;

          background:
            transparent;

          color: #667085;

          padding: 0;

          font-size: 17px;
        }

        .resume-paiement-ligne {
          padding: 6px 1px;

          border-bottom:
            1px solid #f1f3f5;
        }

        .resume-paiement-ligne:last-child {
          border-bottom: 0;
        }

        @media (
          max-width: 1100px
        ) {
          .resume-grands-chiffres {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 800px
        ) {
          .resume-mois {
            height: auto;
          }

          .resume-mois-contenu {
            overflow: visible;
          }

          .resume-grands-chiffres {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (
          max-width: 450px
        ) {
          .resume-grands-chiffres {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>

      <aside className="resume-mois">
        <div className="resume-mois-header">
          <span>
            Résumé du mois
          </span>

          <h3>
            {nomsMois[mois]}{" "}
            {annee}
          </h3>
        </div>

        <div className="resume-mois-contenu">
          <div className="resume-grands-chiffres">
            <div className="resume-principal">
              <div className="resume-principal-label">
                Dépenses totales
              </div>

              <div className="resume-principal-montant">
                {argent(total)}
              </div>
            </div>

            <div className="resume-principal">
              <div className="resume-principal-label">
                Moyenne mensuelle
              </div>

              <div className="resume-principal-montant">
                {moyenneMensuelle ===
                null
                  ? "—"
                  : argent(
                      moyenneMensuelle
                    )}
              </div>

              <div className="resume-principal-note">
                {nombreMoisComplets >
                0
                  ? `${nombreMoisComplets} mois complet${
                      nombreMoisComplets >
                      1
                        ? "s"
                        : ""
                    } depuis juillet 2026`
                  : "Aucun mois complet disponible"}
              </div>
            </div>
          </div>

          <div className="resume-stats">
            <div className="resume-stat">
              <div className="resume-stat-label">
                Achats
              </div>

              <div className="resume-stat-valeur">
                {
                  occurrencesMois.length
                }
              </div>
            </div>

            <div className="resume-stat">
              <div className="resume-stat-label">
                Moy. / semaine
              </div>

              <div className="resume-stat-valeur">
                {estMoisFutur
                  ? "—"
                  : argent(
                      moyenneSemaine
                    )}
              </div>

              {!estMoisFutur &&
                dernierJourMoyenne && (
                  <div className="resume-stat-note">
                    sur{" "}
                    {
                      dernierJourMoyenne
                    }{" "}
                    jour
                    {dernierJourMoyenne >
                    1
                      ? "s"
                      : ""}
                  </div>
                )}
            </div>
          </div>

          {categorieSelectionnee && (
            <div className="resume-filtre-actif">
              <div className="resume-filtre-nom">
                <span
                  className="categorie-point"
                  style={{
                    backgroundColor:
                      couleurCategorie(
                        categorieSelectionnee
                      ),
                  }}
                />

                <span>
                  Affichage :{" "}
                  <strong>
                    {
                      categorieSelectionnee
                    }
                  </strong>
                </span>
              </div>

              <button
                title="Enlever le filtre"
                onClick={() =>
                  selectionnerCategorie(
                    categorieSelectionnee
                  )
                }
              >
                ×
              </button>
            </div>
          )}

          {listeCategories.length >
            0 && (
            <div className="resume-section">
              <div className="resume-section-title">
                Catégories
              </div>

              {listeCategories.map(
                (categorie) => {
                  const pourcentage =
                    total > 0
                      ? (categorie.montant /
                          total) *
                        100
                      : 0;

                  const active =
                    categorieSelectionnee ===
                    categorie.nom;

                  const couleur =
                    couleurCategorie(
                      categorie.nom
                    );

                  return (
                    <div
                      key={
                        categorie.nom
                      }
                      className={`resume-categorie ${
                        active
                          ? "resume-categorie-active"
                          : ""
                      }`}
                      onClick={() =>
                        selectionnerCategorie(
                          categorie.nom
                        )
                      }
                    >
                      <div className="resume-ligne">
                        <div className="resume-categorie-nom">
                          <span
                            className="categorie-point"
                            style={{
                              backgroundColor:
                                couleur,
                            }}
                          />

                          <span className="categorie-texte">
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

                      <div className="resume-barre">
                        <div
                          className="resume-barre-remplie"
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
              )}
            </div>
          )}

          {listePaiements.length >
            0 && (
            <div className="resume-section">
              <div className="resume-section-title">
                Modes de paiement
              </div>

              {listePaiements.map(
                (paiement) => (
                  <div
                    className="resume-ligne resume-paiement-ligne"
                    key={
                      paiement.nom
                    }
                  >
                    <span>
                      {
                        paiement.nom
                      }
                    </span>

                    <strong>
                      {argent(
                        paiement.montant
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default ResumeMois;