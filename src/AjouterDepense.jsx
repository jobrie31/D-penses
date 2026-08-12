import {
  useEffect,
  useMemo,
  useState,
} from "react";

function AjouterDepense({
  depenses,
  dateSelectionnee,
  setDateSelectionnee,
  ajouterDepense,
  modifierDepense,
  depenseAModifier,
  fermer,
}) {
  const estModification =
    Boolean(depenseAModifier);

  const categories = [
    "Épicerie",
    "Restaurant",
    "Gaz",
    "Auto",
    "Logement",
    "Abonnements",
    "Loisirs",
    "Vêtements",
    "Santé",
    "Voyage",
    "Cadeau",
    "Achat",
    "Autre",
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

  const [
    categorie,
    setCategorie,
  ] = useState("Épicerie");

  const [
    nomSelectionne,
    setNomSelectionne,
  ] = useState("__nouveau__");

  const [
    nouveauNom,
    setNouveauNom,
  ] = useState("");

  const [montant, setMontant] =
    useState("");

  const [
    recurrence,
    setRecurrence,
  ] = useState("unique");

  const [
    modePaiement,
    setModePaiement,
  ] = useState(
    "CIBC Mastercard"
  );

  const [
    dateFinRecurrence,
    setDateFinRecurrence,
  ] = useState("");

  const [
    chargement,
    setChargement,
  ] = useState(false);

  const nomsDisponibles =
    useMemo(() => {
      const noms = depenses
        .filter(
          (depense) =>
            normaliserCategorie(
              depense.categorie
            ) === categorie
        )
        .map(
          (depense) =>
            depense.nom?.trim()
        )
        .filter(Boolean);

      return [
        ...new Set(noms),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "fr",
          {
            sensitivity:
              "base",
          }
        )
      );
    }, [
      depenses,
      categorie,
    ]);

  useEffect(() => {
    if (
      !depenseAModifier
    ) {
      return;
    }

    const categorieModifiee =
      normaliserCategorie(
        depenseAModifier.categorie
      );

    setCategorie(
      categorieModifiee
    );

    setMontant(
      depenseAModifier.montant ??
        ""
    );

    setModePaiement(
      depenseAModifier.modePaiement ||
        "CIBC Mastercard"
    );

    setRecurrence(
      depenseAModifier.recurrence ||
        "unique"
    );

    setDateFinRecurrence(
      depenseAModifier
        .dateFinRecurrence || ""
    );

    if (
      depenseAModifier.date
    ) {
      setDateSelectionnee(
        depenseAModifier.date
      );
    }

    setNouveauNom(
      depenseAModifier.nom ||
        ""
    );
  }, [
    depenseAModifier,
    setDateSelectionnee,
  ]);

  useEffect(() => {
    if (
      estModification &&
      depenseAModifier
    ) {
      const nomOriginal =
        depenseAModifier.nom ||
        "";

      const categorieOriginale =
        normaliserCategorie(
          depenseAModifier.categorie
        );

      if (
        categorie ===
          categorieOriginale &&
        nomsDisponibles.includes(
          nomOriginal
        )
      ) {
        setNomSelectionne(
          nomOriginal
        );

        setNouveauNom("");

        return;
      }
    }

    setNomSelectionne(
      "__nouveau__"
    );

    if (!estModification) {
      setNouveauNom("");
    }
  }, [
    categorie,
    nomsDisponibles,
    estModification,
    depenseAModifier,
  ]);

  const changerCategorie =
    (nouvelleCategorie) => {
      setCategorie(
        nouvelleCategorie
      );

      setNomSelectionne(
        "__nouveau__"
      );

      setNouveauNom("");
    };

  const changerNomSelectionne =
    (valeur) => {
      setNomSelectionne(
        valeur
      );

      if (
        valeur !==
        "__nouveau__"
      ) {
        setNouveauNom("");
      }
    };

  const changerRecurrence =
    (valeur) => {
      setRecurrence(valeur);

      if (
        valeur === "unique"
      ) {
        setDateFinRecurrence(
          ""
        );
      }
    };

  const soumettre =
    async (e) => {
      e.preventDefault();

      const nomFinal =
        nomSelectionne ===
        "__nouveau__"
          ? nouveauNom.trim()
          : nomSelectionne.trim();

      if (!nomFinal) {
        alert(
          "Choisis ou entre un nom."
        );

        return;
      }

      if (
        !montant ||
        Number(montant) <= 0
      ) {
        alert(
          "Entre un montant valide."
        );

        return;
      }

      /*
       * La date de fin est OPTIONNELLE.
       *
       * On valide seulement si
       * l'utilisateur en a choisi une.
       */

      if (
        recurrence !==
          "unique" &&
        dateFinRecurrence &&
        dateFinRecurrence <
          dateSelectionnee
      ) {
        alert(
          "La date de fin doit être égale ou après la date de début."
        );

        return;
      }

      const donnees = {
        nom: nomFinal,

        montant:
          Number(montant),

        categorie,

        modePaiement,

        date:
          dateSelectionnee,

        recurrence,

        /*
         * Pas de date =
         * récurrence sans fin.
         */

        dateFinRecurrence:
          recurrence ===
            "unique" ||
          !dateFinRecurrence
            ? null
            : dateFinRecurrence,

        modifieLe:
          new Date().toISOString(),
      };

      try {
        setChargement(true);

        if (
          estModification
        ) {
          await modifierDepense(
            depenseAModifier.id,
            donnees
          );
        } else {
          await ajouterDepense({
            ...donnees,

            creeLe:
              new Date().toISOString(),
          });
        }
      } finally {
        setChargement(false);
      }
    };

  return (
    <>
      <style>{`
        .depense-overlay {
          position: fixed;
          inset: 0;

          z-index: 1000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(
              15,
              23,
              42,
              0.42
            );
        }

        .depense-modal {
          width: 100%;
          max-width: 500px;

          max-height:
            calc(
              100dvh - 30px
            );

          overflow-y: auto;

          padding: 22px;

          background: white;

          border-radius: 14px;

          box-shadow:
            0 20px 60px
            rgba(
              15,
              23,
              42,
              0.2
            );
        }

        .depense-modal-header {
          display: flex;

          align-items: center;
          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 18px;
        }

        .depense-modal-header h2 {
          margin: 0;

          font-size: 20px;
        }

        .depense-modal-fermer {
          border: 0;

          background:
            transparent;

          color: #667085;

          font-size: 25px;
        }

        .depense-form {
          display: flex;

          flex-direction: column;

          gap: 13px;
        }

        .depense-form label {
          display: flex;

          flex-direction: column;

          gap: 5px;

          color: #344054;

          font-size: 12px;

          font-weight: 650;
        }

        .depense-form input,
        .depense-form select {
          width: 100%;

          border:
            1px solid #d5dae0;

          border-radius: 8px;

          padding: 10px 11px;

          background: white;

          color: #182230;

          outline: none;
        }

        .depense-form input:focus,
        .depense-form select:focus {
          border-color: #667085;

          box-shadow:
            0 0 0 2px
            rgba(
              102,
              112,
              133,
              0.1
            );
        }

        .nom-nouveau {
          margin-top: 2px;

          padding: 10px;

          border-radius: 8px;

          background: #f7f8fa;

          border:
            1px solid #eaecf0;
        }

        .nom-nouveau-label {
          display: block;

          margin-bottom: 6px;

          color: #667085;

          font-size: 10px;

          font-weight: 650;
        }

        .banque-info {
          margin-top: 4px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 500;
        }

        .recurrence-info {
          margin-top: 3px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 500;
        }

        .depense-modal-actions {
          display: flex;

          justify-content:
            flex-end;

          gap: 8px;

          margin-top: 5px;
        }

        .modal-btn {
          border: 0;

          border-radius: 8px;

          padding: 9px 14px;

          font-weight: 650;
        }

        .modal-btn-annuler {
          background: white;

          color: #344054;

          border:
            1px solid #d5dae0;
        }

        .modal-btn-enregistrer {
          background: #1f2937;

          color: white;
        }

        .modal-btn:disabled {
          opacity: 0.55;

          cursor: not-allowed;
        }

        .serie-info {
          padding: 9px 11px;

          margin-bottom: 12px;

          border-radius: 7px;

          background: #f7f8fa;

          color: #667085;

          font-size: 11px;
        }
      `}</style>

      <div className="depense-overlay">
        <div className="depense-modal">
          <div className="depense-modal-header">
            <h2>
              {estModification
                ? "Modifier la dépense"
                : "Ajouter une dépense"}
            </h2>

            <button
              type="button"
              className="depense-modal-fermer"
              onClick={fermer}
            >
              ×
            </button>
          </div>

          {estModification &&
            recurrence !==
              "unique" && (
              <div className="serie-info">
                Cette dépense est
                récurrente. Les
                modifications
                s'appliqueront à toute
                la série.
              </div>
            )}

          <form
            className="depense-form"
            onSubmit={soumettre}
          >
            <label>
              Catégorie

              <select
                value={categorie}
                onChange={(e) =>
                  changerCategorie(
                    e.target.value
                  )
                }
              >
                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Nom

              <select
                value={
                  nomSelectionne
                }
                onChange={(e) =>
                  changerNomSelectionne(
                    e.target.value
                  )
                }
              >
                {nomsDisponibles.map(
                  (nom) => (
                    <option
                      key={nom}
                      value={nom}
                    >
                      {nom}
                    </option>
                  )
                )}

                <option value="__nouveau__">
                  + Nouveau nom
                </option>
              </select>

              {nomsDisponibles.length >
                0 && (
                <span className="banque-info">
                  {
                    nomsDisponibles.length
                  }{" "}
                  nom
                  {nomsDisponibles.length >
                  1
                    ? "s"
                    : ""}{" "}
                  déjà utilisé
                  {nomsDisponibles.length >
                  1
                    ? "s"
                    : ""}{" "}
                  dans cette catégorie
                </span>
              )}
            </label>

            {nomSelectionne ===
              "__nouveau__" && (
              <div className="nom-nouveau">
                <span className="nom-nouveau-label">
                  Nouveau nom
                </span>

                <input
                  type="text"
                  value={nouveauNom}
                  onChange={(e) =>
                    setNouveauNom(
                      e.target.value
                    )
                  }
                  placeholder="Ex. Costco, Amazon, Shell..."
                  autoFocus
                />
              </div>
            )}

            <label>
              Montant

              <input
                type="number"
                min="0"
                step="0.01"
                value={montant}
                onChange={(e) =>
                  setMontant(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Date

              <input
                type="date"
                value={
                  dateSelectionnee
                }
                onChange={(e) =>
                  setDateSelectionnee(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Mode de paiement

              <select
                value={
                  modePaiement
                }
                onChange={(e) =>
                  setModePaiement(
                    e.target.value
                  )
                }
              >
                <option>
                  CIBC Mastercard
                </option>

                <option>
                  CIBC Visa
                </option>

                <option>
                  Débit Tangerine
                </option>

                <option>
                  Débit Desjardins
                </option>
              </select>
            </label>

            <label>
              Récurrence

              <select
                value={recurrence}
                onChange={(e) =>
                  changerRecurrence(
                    e.target.value
                  )
                }
              >
                <option value="unique">
                  Une seule fois
                </option>

                <option value="hebdomadaire">
                  Chaque semaine
                </option>

                <option value="bihebdomadaire">
                  Aux 2 semaines
                </option>

                <option value="mensuelle">
                  Chaque mois
                </option>

                <option value="annuelle">
                  Chaque année
                </option>
              </select>
            </label>

            {recurrence !==
              "unique" && (
              <label>
                Date de fin
                (optionnelle)

                <input
                  type="date"
                  min={
                    dateSelectionnee
                  }
                  value={
                    dateFinRecurrence
                  }
                  onChange={(e) =>
                    setDateFinRecurrence(
                      e.target.value
                    )
                  }
                />

                <span className="recurrence-info">
                  Laisse vide pour que
                  la récurrence continue
                  sans date de fin.
                </span>
              </label>
            )}

            <div className="depense-modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-annuler"
                onClick={fermer}
                disabled={
                  chargement
                }
              >
                Annuler
              </button>

              <button
                type="submit"
                className="modal-btn modal-btn-enregistrer"
                disabled={
                  chargement
                }
              >
                {chargement
                  ? "Enregistrement..."
                  : estModification
                  ? "Enregistrer"
                  : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AjouterDepense;