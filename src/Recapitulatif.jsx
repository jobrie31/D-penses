function Recapitulatif({ depenses }) {
  const maintenant = new Date();
  const moisActuel =
    maintenant.getMonth();
  const anneeActuelle =
    maintenant.getFullYear();

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

  const argent = (montant) =>
    Number(montant || 0).toLocaleString(
      "fr-CA",
      {
        style: "currency",
        currency: "CAD",
      }
    );

  const obtenirDate = (depense) =>
    depense.date
      ? new Date(
          `${depense.date}T12:00:00`
        )
      : null;

  const depensesMois = depenses.filter(
    (depense) => {
      const date = obtenirDate(depense);

      return (
        date &&
        date.getMonth() === moisActuel &&
        date.getFullYear() ===
          anneeActuelle
      );
    }
  );

  const depensesAnnee =
    depenses.filter((depense) => {
      const date = obtenirDate(depense);

      return (
        date &&
        date.getFullYear() ===
          anneeActuelle
      );
    });

  const calculerTotal = (liste) =>
    liste.reduce(
      (total, depense) =>
        total +
        Number(depense.montant || 0),
      0
    );

  const totalMois =
    calculerTotal(depensesMois);

  const totalAnnee =
    calculerTotal(depensesAnnee);

  const categories = (liste) => {
    const resultats = {};

    liste.forEach((depense) => {
      const categorie =
        depense.categorie || "Autre";

      resultats[categorie] =
        (resultats[categorie] || 0) +
        Number(depense.montant || 0);
    });

    return Object.entries(resultats)
      .map(([nom, montant]) => ({
        nom,
        montant,
      }))
      .sort(
        (a, b) =>
          b.montant - a.montant
      );
  };

  const categoriesMois =
    categories(depensesMois);

  const categoriesAnnee =
    categories(depensesAnnee);

  const topMois = [...depensesMois]
    .sort(
      (a, b) =>
        Number(b.montant) -
        Number(a.montant)
    )
    .slice(0, 10);

  const topAnnee = [...depensesAnnee]
    .sort(
      (a, b) =>
        Number(b.montant) -
        Number(a.montant)
    )
    .slice(0, 10);

  return (
    <>
      <style>{`
        .recap-title {
          margin-bottom: 20px;
        }

        .recap-title h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.4px;
        }

        .recap-title p {
          margin: 5px 0 0;
          color: #7b8490;
          font-size: 14px;
        }

        .recap-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .recap-summary-card {
          background: white;
          border: 1px solid #e4e8ec;
          border-radius: 13px;
          padding: 18px 20px;
        }

        .recap-summary-label {
          color: #7d8691;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .recap-summary-value {
          font-size: 24px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .recap-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .recap-panel {
          background: white;
          border: 1px solid #e4e8ec;
          border-radius: 13px;
          overflow: hidden;
        }

        .recap-panel-title {
          padding: 17px 19px;
          border-bottom: 1px solid #edf0f2;
          font-size: 15px;
          font-weight: 700;
        }

        .recap-list {
          padding: 5px 19px;
        }

        .recap-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f4;
        }

        .recap-row:last-child {
          border-bottom: 0;
        }

        .recap-row-info {
          min-width: 0;
        }

        .recap-row-name {
          font-size: 14px;
          font-weight: 650;
        }

        .recap-row-detail {
          margin-top: 3px;
          color: #9299a2;
          font-size: 11px;
        }

        .recap-row-value {
          font-weight: 700;
          white-space: nowrap;
        }

        .recap-rank {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          background: #f1f3f5;
          color: #626a75;
          font-size: 11px;
          font-weight: 750;
        }

        .recap-top-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f4;
        }

        .recap-top-row:last-child {
          border-bottom: 0;
        }

        .recap-empty {
          padding: 32px;
          text-align: center;
          color: #9097a1;
          font-size: 13px;
        }

        @media (max-width: 950px) {
          .recap-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .recap-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .recap-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="recap-title">
        <h2>Récapitulatif</h2>
        <p>
          Vue d'ensemble de tes dépenses
        </p>
      </div>

      <div className="recap-summary">
        <Carte
          label={`${nomsMois[moisActuel]} ${anneeActuelle}`}
          valeur={argent(totalMois)}
        />

        <Carte
          label={`Année ${anneeActuelle}`}
          valeur={argent(totalAnnee)}
        />

        <Carte
          label="Dépenses ce mois"
          valeur={depensesMois.length}
        />

        <Carte
          label="Dépenses cette année"
          valeur={depensesAnnee.length}
        />
      </div>

      <div className="recap-grid">
        <Categories
          titre={`Catégories — ${nomsMois[moisActuel]}`}
          liste={categoriesMois}
          total={totalMois}
          argent={argent}
        />

        <Categories
          titre={`Catégories — ${anneeActuelle}`}
          liste={categoriesAnnee}
          total={totalAnnee}
          argent={argent}
        />
      </div>

      <div className="recap-grid">
        <Top
          titre={`Top 10 — ${nomsMois[moisActuel]}`}
          liste={topMois}
          argent={argent}
        />

        <Top
          titre={`Top 10 — ${anneeActuelle}`}
          liste={topAnnee}
          argent={argent}
        />
      </div>
    </>
  );
}

function Carte({ label, valeur }) {
  return (
    <div className="recap-summary-card">
      <div className="recap-summary-label">
        {label}
      </div>

      <div className="recap-summary-value">
        {valeur}
      </div>
    </div>
  );
}

function Categories({
  titre,
  liste,
  total,
  argent,
}) {
  return (
    <section className="recap-panel">
      <div className="recap-panel-title">
        {titre}
      </div>

      {liste.length === 0 ? (
        <div className="recap-empty">
          Aucune dépense
        </div>
      ) : (
        <div className="recap-list">
          {liste.map((item) => (
            <div
              className="recap-row"
              key={item.nom}
            >
              <div className="recap-row-info">
                <div className="recap-row-name">
                  {item.nom}
                </div>

                <div className="recap-row-detail">
                  {total > 0
                    ? `${(
                        (item.montant /
                          total) *
                        100
                      ).toFixed(1)} %`
                    : "0 %"}
                </div>
              </div>

              <div className="recap-row-value">
                {argent(item.montant)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Top({
  titre,
  liste,
  argent,
}) {
  return (
    <section className="recap-panel">
      <div className="recap-panel-title">
        {titre}
      </div>

      {liste.length === 0 ? (
        <div className="recap-empty">
          Aucune dépense
        </div>
      ) : (
        <div className="recap-list">
          {liste.map(
            (depense, index) => (
              <div
                className="recap-top-row"
                key={depense.id}
              >
                <div className="recap-rank">
                  {index + 1}
                </div>

                <div
                  className="recap-row-info"
                  style={{ flex: 1 }}
                >
                  <div className="recap-row-name">
                    {depense.nom}
                  </div>

                  <div className="recap-row-detail">
                    {depense.categorie} ·{" "}
                    {depense.date}
                  </div>
                </div>

                <div className="recap-row-value">
                  {argent(
                    depense.montant
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

export default Recapitulatif;