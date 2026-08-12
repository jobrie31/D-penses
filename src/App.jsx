import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

import Calendrier from "./Calendrier";
import AjouterDepense from "./AjouterDepense";
import Recapitulatif from "./Recapitulatif";
import ResumeMois from "./ResumeMois";

function App() {
  const maintenant = new Date();

  const [depenses, setDepenses] = useState([]);

  const [
    afficherAjout,
    setAfficherAjout,
  ] = useState(false);

  const [
    depenseAModifier,
    setDepenseAModifier,
  ] = useState(null);

  const [
    categorieSelectionnee,
    setCategorieSelectionnee,
  ] = useState(null);

  const [page, setPage] =
    useState("calendrier");

  const [erreur, setErreur] =
    useState("");

  const [
    dateSelectionnee,
    setDateSelectionnee,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    moisAffiche,
    setMoisAffiche,
  ] = useState(
    new Date(
      maintenant.getFullYear(),
      maintenant.getMonth(),
      1
    )
  );

  useEffect(() => {
    const depensesRef = collection(
      db,
      "applications",
      "depenses",
      "depenses"
    );

    const q = query(
      depensesRef,
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {
        const liste =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          );

        setDepenses(liste);
        setErreur("");
      },

      (err) => {
        console.error(
          "Erreur Firestore :",
          err
        );

        setErreur(
          "Impossible de charger les dépenses."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const ajouterDepense =
    async (depense) => {
      try {
        const depensesRef =
          collection(
            db,
            "applications",
            "depenses",
            "depenses"
          );

        await addDoc(
          depensesRef,
          depense
        );

        setAfficherAjout(false);
        setErreur("");
      } catch (err) {
        console.error(
          "Erreur ajout :",
          err
        );

        setErreur(
          "Impossible d'ajouter la dépense."
        );

        throw err;
      }
    };

  const modifierDepense =
    async (
      id,
      nouvelleDepense
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "applications",
            "depenses",
            "depenses",
            id
          ),
          nouvelleDepense
        );

        setDepenseAModifier(null);
        setErreur("");
      } catch (err) {
        console.error(
          "Erreur modification :",
          err
        );

        setErreur(
          "Impossible de modifier la dépense."
        );

        throw err;
      }
    };

  const supprimerDepense =
    async (id) => {
      const depense =
        depenses.find(
          (item) =>
            item.id === id
        );

      const recurrente =
        depense &&
        depense.recurrence !==
          "unique";

      const message =
        recurrente
          ? "Cette dépense est récurrente. Supprimer toute la série?"
          : "Voulez-vous supprimer cette dépense?";

      if (
        !window.confirm(message)
      ) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "applications",
            "depenses",
            "depenses",
            id
          )
        );
      } catch (err) {
        console.error(
          "Erreur suppression :",
          err
        );

        setErreur(
          "Impossible de supprimer la dépense."
        );
      }
    };

  const ouvrirAjout = () => {
    setDepenseAModifier(null);
    setAfficherAjout(true);
  };

  const ouvrirModification =
    (id) => {
      const depense =
        depenses.find(
          (item) =>
            item.id === id
        );

      if (!depense) return;

      setAfficherAjout(false);

      setDepenseAModifier(
        depense
      );
    };

  const selectionnerCategorie =
    (categorie) => {
      setCategorieSelectionnee(
        (ancienneCategorie) =>
          ancienneCategorie ===
          categorie
            ? null
            : categorie
      );
    };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          height: 100%;
        }

        body {
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background: #f4f6f8;
          color: #18202a;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          width: 100%;
          height: 100dvh;

          display: flex;
          flex-direction: column;

          padding:
            clamp(8px, 1vw, 16px)
            clamp(10px, 1.3vw, 24px);

          overflow: hidden;
        }

        .app-header {
          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 8px;
        }

        .app-title h1 {
          margin: 0;

          font-size:
            clamp(
              18px,
              1.3vw,
              24px
            );

          font-weight: 760;

          letter-spacing:
            -0.45px;
        }

        .app-title p {
          margin: 2px 0 0;

          color: #7b8490;

          font-size:
            clamp(
              9px,
              0.7vw,
              12px
            );
        }

        .app-actions {
          display: flex;
          gap: 7px;
        }

        .app-btn {
          border: 0;

          border-radius: 8px;

          padding:
            clamp(6px, 0.7vh, 9px)
            clamp(9px, 0.8vw, 14px);

          font-size:
            clamp(
              10px,
              0.7vw,
              13px
            );

          font-weight: 680;

          white-space: nowrap;
        }

        .app-btn-primary {
          color: white;
          background: #1f2937;
        }

        .app-btn-primary:hover {
          background: #111827;
        }

        .app-btn-secondary {
          color: #374151;
          background: white;

          border:
            1px solid #dfe3e8;
        }

        .app-btn-secondary:hover {
          background: #f8fafc;
        }

        .message-erreur {
          flex: 0 0 auto;

          margin-bottom: 7px;

          padding: 7px 10px;

          border:
            1px solid #ffd2d2;

          border-radius: 7px;

          background: #fff1f1;

          color: #a61b1b;

          font-size: 11px;
        }

        .page-calendrier {
          flex: 1 1 0;
          min-height: 0;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            clamp(
              280px,
              22vw,
              380px
            );

          gap:
            clamp(
              9px,
              0.9vw,
              16px
            );

          overflow: hidden;
        }

        .page-recap {
          flex: 1 1 0;

          min-height: 0;

          overflow-y: auto;
        }

        @media (
          max-width: 1100px
        ) {
          .page-calendrier {
            grid-template-columns:
              minmax(0, 1fr)
              250px;
          }
        }

        @media (
          max-width: 800px
        ) {
          html,
          body,
          #root {
            height: auto;
            min-height: 100%;
          }

          .app {
            height: auto;
            min-height: 100dvh;

            overflow: visible;

            padding: 10px;
          }

          .app-title p {
            display: none;
          }

          .page-calendrier {
            display: flex;

            flex-direction: column;

            overflow: visible;
          }

          .app-actions {
            gap: 4px;
          }

          .app-btn {
            padding: 6px 8px;

            font-size: 10px;
          }
        }

        @media (
          max-width: 430px
        ) {
          .app-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .app-actions {
            width: 100%;
          }

          .app-actions button {
            flex: 1;
          }
        }
      `}</style>

      <div className="app">
        <header className="app-header">
          <div className="app-title">
            <h1>
              Mes dépenses
            </h1>

            <p>
              Suivi de mes dépenses personnelles
            </p>
          </div>

          <div className="app-actions">
            {page === "calendrier" ? (
              <button
                className="app-btn app-btn-secondary"
                onClick={() =>
                  setPage("recap")
                }
              >
                Récapitulatif
              </button>
            ) : (
              <button
                className="app-btn app-btn-secondary"
                onClick={() =>
                  setPage("calendrier")
                }
              >
                ← Calendrier
              </button>
            )}

            <button
              className="app-btn app-btn-primary"
              onClick={ouvrirAjout}
            >
              + Ajouter
            </button>
          </div>
        </header>

        {erreur && (
          <div className="message-erreur">
            {erreur}
          </div>
        )}

        {page === "calendrier" && (
          <div className="page-calendrier">
            <Calendrier
              depenses={depenses}
              dateSelectionnee={
                dateSelectionnee
              }
              setDateSelectionnee={
                setDateSelectionnee
              }
              supprimerDepense={
                supprimerDepense
              }
              ouvrirModification={
                ouvrirModification
              }
              moisAffiche={
                moisAffiche
              }
              setMoisAffiche={
                setMoisAffiche
              }
              categorieSelectionnee={
                categorieSelectionnee
              }
            />

            <ResumeMois
              depenses={depenses}
              moisAffiche={
                moisAffiche
              }
              categorieSelectionnee={
                categorieSelectionnee
              }
              selectionnerCategorie={
                selectionnerCategorie
              }
            />
          </div>
        )}

        {page === "recap" && (
          <div className="page-recap">
            <Recapitulatif
              depenses={depenses}
            />
          </div>
        )}

        {(afficherAjout ||
          depenseAModifier) && (
          <AjouterDepense
            depenses={depenses}
            dateSelectionnee={
              dateSelectionnee
            }
            setDateSelectionnee={
              setDateSelectionnee
            }
            ajouterDepense={
              ajouterDepense
            }
            modifierDepense={
              modifierDepense
            }
            depenseAModifier={
              depenseAModifier
            }
            fermer={() => {
              setAfficherAjout(false);
              setDepenseAModifier(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;