import {
  useMemo,
  useState,
} from "react";

import {
  occurrencesEntre,
} from "./depensesUtils";

function Calendrier({
  depenses,
  dateSelectionnee,
  setDateSelectionnee,
  supprimerDepense,
  ouvrirModification,
  deplacerDepense,
  moisAffiche,
  setMoisAffiche,
  categorieSelectionnee,
}) {
  const [
    dateSurvolee,
    setDateSurvolee,
  ] = useState(null);

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

  const joursSemaine = [
    "Dim",
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
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

  const formatterDate = (
    annee,
    mois,
    jour
  ) =>
    `${annee}-${String(
      mois + 1
    ).padStart(2, "0")}-${String(
      jour
    ).padStart(2, "0")}`;

  const premierJour =
    new Date(
      annee,
      mois,
      1
    );

  const indexPremierJour =
    premierJour.getDay();

  const nombreJours =
    new Date(
      annee,
      mois + 1,
      0
    ).getDate();

  const cellules = [];

  for (
    let i = 0;
    i < indexPremierJour;
    i++
  ) {
    cellules.push(null);
  }

  for (
    let jour = 1;
    jour <= nombreJours;
    jour++
  ) {
    cellules.push(jour);
  }

  while (
    cellules.length % 7 !==
    0
  ) {
    cellules.push(null);
  }

  const nombreSemaines =
    cellules.length / 7;

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

  const occurrences =
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

  const aujourdHui =
    new Date()
      .toISOString()
      .split("T")[0];

  const moisPrecedent = () => {
    setMoisAffiche(
      new Date(
        annee,
        mois - 1,
        1
      )
    );
  };

  const moisSuivant = () => {
    setMoisAffiche(
      new Date(
        annee,
        mois + 1,
        1
      )
    );
  };

  const allerAujourdhui =
    () => {
      const date =
        new Date();

      setMoisAffiche(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );

      setDateSelectionnee(
        date
          .toISOString()
          .split("T")[0]
      );
    };

  const classeRecurrence = (
    recurrence
  ) => {
    switch (recurrence) {
      case "hebdomadaire":
        return "depense-hebdo";

      case "bihebdomadaire":
        return "depense-2sem";

      case "mensuelle":
        return "depense-mensuelle";

      case "annuelle":
        return "depense-annuelle";

      default:
        return "depense-unique";
    }
  };

  /*
   * ==============================
   * DRAG & DROP
   * ==============================
   */

  const commencerDeplacement =
    (
      evenement,
      depense
    ) => {
      evenement.stopPropagation();

      evenement.dataTransfer.effectAllowed =
        "move";

      evenement.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: depense.id,

          dateOccurrence:
            depense.dateOccurrence,
        })
      );
    };

  const autoriserDepot =
    (
      evenement,
      date
    ) => {
      evenement.preventDefault();

      evenement.dataTransfer.dropEffect =
        "move";

      setDateSurvolee(
        date
      );
    };

  const terminerSurvol =
    (
      evenement,
      date
    ) => {
      /*
       * On évite de retirer le
       * surlignage lorsqu'on passe
       * sur un enfant de la case.
       */

      if (
        evenement.currentTarget.contains(
          evenement.relatedTarget
        )
      ) {
        return;
      }

      if (
        dateSurvolee === date
      ) {
        setDateSurvolee(
          null
        );
      }
    };

  const deposerDepense =
    async (
      evenement,
      nouvelleDate
    ) => {
      evenement.preventDefault();

      evenement.stopPropagation();

      setDateSurvolee(
        null
      );

      const donnees =
        evenement.dataTransfer.getData(
          "application/json"
        );

      if (!donnees) {
        return;
      }

      try {
        const {
          id,
          dateOccurrence,
        } =
          JSON.parse(
            donnees
          );

        await deplacerDepense(
          id,
          dateOccurrence,
          nouvelleDate
        );
      } catch (err) {
        console.error(
          "Erreur drag/drop :",
          err
        );
      }
    };

  return (
    <>
      <style>{`
        .calendrier {
          min-width: 0;
          min-height: 0;

          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;

          background: white;

          border:
            1px solid #dfe4e9;

          border-radius: 10px;

          overflow: hidden;
        }

        .calendrier-header {
          flex: 0 0 auto;

          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 10px;

          padding:
            clamp(
              6px,
              0.7vh,
              10px
            )
            clamp(
              8px,
              0.8vw,
              14px
            );

          border-bottom:
            1px solid #e8ecf0;
        }

        .calendrier-header h2 {
          margin: 0;

          font-size:
            clamp(
              14px,
              1vw,
              18px
            );

          font-weight: 760;
        }

        .calendrier-navigation {
          display: flex;

          gap: 5px;
        }

        .calendrier-navigation button {
          border:
            1px solid #d9dee5;

          background: white;

          color: #344054;

          border-radius: 6px;

          padding: 4px 8px;

          font-size:
            clamp(
              9px,
              0.65vw,
              12px
            );

          font-weight: 650;
        }

        .calendrier-navigation button:hover {
          background: #f6f8fa;
        }

        .calendrier-semaine {
          flex: 0 0 auto;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              minmax(0, 1fr)
            );

          background: #f8fafb;

          border-bottom:
            1px solid #e8ecf0;
        }

        .calendrier-nom-jour {
          padding: 5px 3px;

          text-align: center;

          color: #7d8793;

          font-size:
            clamp(
              8px,
              0.52vw,
              10px
            );

          font-weight: 750;

          text-transform:
            uppercase;
        }

        .calendrier-grille {
          flex: 1 1 0;

          min-height: 0;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              minmax(0, 1fr)
            );

          grid-template-rows:
            repeat(
              ${nombreSemaines},
              minmax(0, 1fr)
            );
        }

        .calendrier-jour {
          min-width: 0;
          min-height: 0;

          position: relative;

          padding:
            clamp(
              3px,
              0.4vw,
              6px
            );

          border-right:
            1px solid #e8ecf0;

          border-bottom:
            1px solid #e8ecf0;

          overflow: hidden;

          background: white;

          cursor: pointer;

          transition:
            background 0.12s ease,
            box-shadow 0.12s ease;
        }

        .calendrier-jour:nth-child(
          7n
        ) {
          border-right: 0;
        }

        .calendrier-jour:hover {
          background: #fafbfc;
        }

        .calendrier-jour-vide {
          background: #fafbfc;

          cursor: default;
        }

        .calendrier-jour-selectionne {
          box-shadow:
            inset 0 0 0
            1.5px
            #25344a;
        }

        /*
         * CASE OÙ ON EST SUR LE POINT
         * DE DÉPOSER LA DÉPENSE
         */

        .calendrier-jour-drop {
          background: #eef6ff;

          box-shadow:
            inset 0 0 0
            2px #3b82f6;
        }

        .calendrier-jour-drop::after {
          content: "Déplacer ici";

          position: absolute;

          left: 50%;
          bottom: 5px;

          transform:
            translateX(-50%);

          padding: 3px 7px;

          border-radius: 20px;

          background: #2563eb;

          color: white;

          font-size: 8px;

          font-weight: 700;

          pointer-events: none;

          white-space: nowrap;

          z-index: 10;
        }

        .jour-haut {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 4px;

          margin-bottom: 3px;
        }

        .jour-numero {
          display: flex;

          align-items: center;
          justify-content: center;

          width:
            clamp(
              18px,
              1.2vw,
              23px
            );

          height:
            clamp(
              18px,
              1.2vw,
              23px
            );

          border-radius: 50%;

          font-size:
            clamp(
              9px,
              0.65vw,
              11px
            );

          font-weight: 780;
        }

        .jour-aujourdhui {
          background: #1f2937;

          color: white;
        }

        .jour-total {
          color: #475467;

          font-size:
            clamp(
              8px,
              0.55vw,
              10px
            );

          font-weight: 760;

          white-space: nowrap;
        }

        .liste-depenses-jour {
          display: flex;

          flex-direction: column;

          gap:
            clamp(
              2px,
              0.3vh,
              4px
            );
        }

        .depense-calendrier {
          min-width: 0;

          display: flex;

          align-items: stretch;

          height:
            clamp(
              22px,
              2.8vh,
              30px
            );

          border:
            1px solid transparent;

          border-radius: 6px;

          overflow: hidden;

          cursor: grab;

          transition:
            opacity 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease,
            filter 0.18s ease;
        }

        .depense-calendrier:active {
          cursor: grabbing;
        }

        .depense-calendrier:hover {
          filter:
            brightness(0.97);
        }

        .depense-calendrier[draggable="true"] {
          user-select: none;
        }

        .depense-calendrier.depense-estompee {
          opacity: 0.18;

          filter:
            grayscale(0.7);
        }

        .depense-calendrier.depense-surlignee {
          opacity: 1;

          transform:
            scale(1.025);

          box-shadow:
            0 0 0 2px
            rgba(
              31,
              41,
              55,
              0.3
            ),
            0 3px 8px
            rgba(
              15,
              23,
              42,
              0.16
            );

          z-index: 2;
        }

        .depense-barre {
          flex: 0 0 auto;

          width: 4px;
        }

        .depense-contenu {
          flex: 1;

          min-width: 0;

          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 5px;

          padding: 0 6px;
        }

        .depense-nom-zone {
          flex: 1;

          min-width: 0;

          display: flex;

          align-items: center;

          gap:
            clamp(
              4px,
              0.35vw,
              7px
            );
        }

        .depense-categorie-point {
          width:
            clamp(
              7px,
              0.5vw,
              10px
            );

          height:
            clamp(
              7px,
              0.5vw,
              10px
            );

          flex-shrink: 0;

          border-radius: 50%;

          box-shadow:
            0 0 0 1px
            rgba(
              255,
              255,
              255,
              0.85
            );
        }

        .depense-nom {
          flex: 1;

          min-width: 0;

          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;

          color: #182230;

          font-size:
            clamp(
              10px,
              0.78vw,
              14px
            );

          font-weight: 760;
        }

        .depense-montant {
          flex-shrink: 0;

          color: #182230;

          font-size:
            clamp(
              9px,
              0.7vw,
              12px
            );

          font-weight: 800;

          white-space: nowrap;
        }

        .depense-supprimer {
          flex-shrink: 0;

          width: 19px;

          border: 0;

          background: transparent;

          color: #98a2b3;

          font-size: 12px;

          cursor: pointer;
        }

        .depense-supprimer:hover {
          color: #b42318;
        }

        /*
         * RÉCURRENCES
         */

        .depense-unique {
          background: #eef2f6;

          border-color:
            #dde3e9;
        }

        .depense-unique
        .depense-barre {
          background: #64748b;
        }

        .depense-hebdo {
          background: #e8f2ff;

          border-color:
            #cfe3ff;
        }

        .depense-hebdo
        .depense-barre {
          background: #2970ff;
        }

        .depense-2sem {
          background: #f1edff;

          border-color:
            #ded5ff;
        }

        .depense-2sem
        .depense-barre {
          background: #7a5af8;
        }

        .depense-mensuelle {
          background: #e9f7ef;

          border-color:
            #caead8;
        }

        .depense-mensuelle
        .depense-barre {
          background: #12b76a;
        }

        .depense-annuelle {
          background: #fff3e6;

          border-color:
            #f8ddbe;
        }

        .depense-annuelle
        .depense-barre {
          background: #f79009;
        }

        .calendrier-legende {
          flex: 0 0 auto;

          display: flex;

          align-items: center;
          justify-content:
            flex-end;

          flex-wrap: wrap;

          gap: 8px;

          padding: 4px 8px;

          border-top:
            1px solid #e8ecf0;

          background: #fafbfc;

          color: #667085;

          font-size: 8px;
        }

        .legende-item {
          display: flex;

          align-items: center;

          gap: 3px;
        }

        .legende-couleur {
          width: 7px;
          height: 7px;

          border-radius: 2px;
        }

        .legende-unique {
          background: #64748b;
        }

        .legende-hebdo {
          background: #2970ff;
        }

        .legende-2sem {
          background: #7a5af8;
        }

        .legende-mois {
          background: #12b76a;
        }

        .legende-annee {
          background: #f79009;
        }

        @media (
          max-width: 800px
        ) {
          .calendrier {
            height: auto;

            min-height: 650px;
          }

          .calendrier-grille {
            flex: none;

            grid-template-rows:
              repeat(
                ${nombreSemaines},
                minmax(
                  85px,
                  auto
                )
              );
          }

          .calendrier-jour {
            min-height: 85px;

            padding: 3px;
          }

          .jour-total {
            display: none;
          }

          .depense-calendrier {
            height: 21px;
          }

          .depense-nom {
            font-size: 8px;
          }

          .depense-montant {
            display: none;
          }

          .depense-supprimer {
            display: none;
          }

          .calendrier-legende {
            justify-content:
              flex-start;
          }
        }
      `}</style>

      <div className="calendrier">
        <div className="calendrier-header">
          <h2>
            {nomsMois[mois]}{" "}
            {annee}
          </h2>

          <div className="calendrier-navigation">
            <button
              onClick={
                moisPrecedent
              }
            >
              ‹
            </button>

            <button
              onClick={
                allerAujourdhui
              }
            >
              Aujourd'hui
            </button>

            <button
              onClick={
                moisSuivant
              }
            >
              ›
            </button>
          </div>
        </div>

        <div className="calendrier-semaine">
          {joursSemaine.map(
            (jour) => (
              <div
                className="calendrier-nom-jour"
                key={jour}
              >
                {jour}
              </div>
            )
          )}
        </div>

        <div className="calendrier-grille">
          {cellules.map(
            (
              jour,
              index
            ) => {
              if (!jour) {
                return (
                  <div
                    key={`vide-${index}`}
                    className="calendrier-jour calendrier-jour-vide"
                  />
                );
              }

              const date =
                formatterDate(
                  annee,
                  mois,
                  jour
                );

              const depensesJour =
                occurrences.filter(
                  (depense) =>
                    depense.dateOccurrence ===
                    date
                );

              const total =
                depensesJour.reduce(
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

              return (
                <div
                  key={date}
                  className={`calendrier-jour ${
                    date ===
                    dateSelectionnee
                      ? "calendrier-jour-selectionne"
                      : ""
                  } ${
                    date ===
                    dateSurvolee
                      ? "calendrier-jour-drop"
                      : ""
                  }`}
                  onClick={() =>
                    setDateSelectionnee(
                      date
                    )
                  }
                  onDragOver={(
                    e
                  ) =>
                    autoriserDepot(
                      e,
                      date
                    )
                  }
                  onDragLeave={(
                    e
                  ) =>
                    terminerSurvol(
                      e,
                      date
                    )
                  }
                  onDrop={(e) =>
                    deposerDepense(
                      e,
                      date
                    )
                  }
                >
                  <div className="jour-haut">
                    <span
                      className={`jour-numero ${
                        date ===
                        aujourdHui
                          ? "jour-aujourdhui"
                          : ""
                      }`}
                    >
                      {jour}
                    </span>

                    {total > 0 && (
                      <span className="jour-total">
                        {argent(
                          total
                        )}
                      </span>
                    )}
                  </div>

                  <div className="liste-depenses-jour">
                    {depensesJour.map(
                      (depense) => {
                        const categorie =
                          normaliserCategorie(
                            depense.categorie
                          );

                        const couleur =
                          couleurCategorie(
                            categorie
                          );

                        const estSelectionnee =
                          categorieSelectionnee &&
                          categorie ===
                            categorieSelectionnee;

                        const estEstompee =
                          categorieSelectionnee &&
                          categorie !==
                            categorieSelectionnee;

                        return (
                          <div
                            key={`${depense.id}-${depense.dateOccurrence}`}
                            draggable
                            onDragStart={(
                              e
                            ) =>
                              commencerDeplacement(
                                e,
                                depense
                              )
                            }
                            onDragEnd={() =>
                              setDateSurvolee(
                                null
                              )
                            }
                            className={`depense-calendrier ${classeRecurrence(
                              depense.recurrence
                            )} ${
                              estSelectionnee
                                ? "depense-surlignee"
                                : ""
                            } ${
                              estEstompee
                                ? "depense-estompee"
                                : ""
                            }`}
                            title={`${categorie} — cliquer pour modifier ou glisser pour déplacer`}
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();

                              ouvrirModification(
                                depense.id
                              );
                            }}
                          >
                            <div className="depense-barre" />

                            <div className="depense-contenu">
                              <div className="depense-nom-zone">
                                <span
                                  className="depense-categorie-point"
                                  style={{
                                    backgroundColor:
                                      couleur,
                                  }}
                                />

                                <span className="depense-nom">
                                  {
                                    depense.nom
                                  }
                                </span>
                              </div>

                              <span className="depense-montant">
                                {argent(
                                  depense.montant
                                )}
                              </span>
                            </div>

                            <button
                              className="depense-supprimer"
                              title="Supprimer"
                              draggable={
                                false
                              }
                              onClick={(
                                e
                              ) => {
                                e.stopPropagation();

                                supprimerDepense(
                                  depense.id
                                );
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="calendrier-legende">
          <div className="legende-item">
            <span className="legende-couleur legende-unique" />
            Unique
          </div>

          <div className="legende-item">
            <span className="legende-couleur legende-hebdo" />
            Hebdo
          </div>

          <div className="legende-item">
            <span className="legende-couleur legende-2sem" />
            2 semaines
          </div>

          <div className="legende-item">
            <span className="legende-couleur legende-mois" />
            Mensuelle
          </div>

          <div className="legende-item">
            <span className="legende-couleur legende-annee" />
            Annuelle
          </div>
        </div>
      </div>
    </>
  );
}

export default Calendrier;