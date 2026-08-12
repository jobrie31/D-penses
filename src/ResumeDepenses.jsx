function ResumeDepenses({
  depenses,
}) {
  const aujourdHui = new Date();

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

  const convertirDate = (date) =>
    date
      ? new Date(
          `${date}T12:00:00`
        )
      : null;

  /*
   * SEMAINE
   */

  const debutSemaine =
    new Date(aujourdHui);

  debutSemaine.setHours(
    0,
    0,
    0,
    0
  );

  const jour =
    debutSemaine.getDay();

  debutSemaine.setDate(
    debutSemaine.getDate() +
      (jour === 0
        ? -6
        : 1 - jour)
  );

  const finSemaine =
    new Date(debutSemaine);

  finSemaine.setDate(
    finSemaine.getDate() + 6
  );

  finSemaine.setHours(
    23,
    59,
    59,
    999
  );

  /*
   * MOIS
   */

  const debutMois = new Date(
    aujourdHui.getFullYear(),
    aujourdHui.getMonth(),
    1
  );

  const finMois = new Date(
    aujourdHui.getFullYear(),
    aujourdHui.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  /*
   * ANNÉE
   */

  const debutAnnee = new Date(
    aujourdHui.getFullYear(),
    0,
    1
  );

  const finAnnee = new Date(
    aujourdHui.getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999
  );

  const totalEntre = (
    debut,
    fin
  ) =>
    depenses
      .filter((depense) => {
        const date =
          convertirDate(
            depense.date
          );

        return (
          date &&
          date >= debut &&
          date <= fin
        );
      })
      .reduce(
        (total, depense) =>
          total +
          Number(
            depense.montant ||
              0
          ),
        0
      );

  const semaine = totalEntre(
    debutSemaine,
    finSemaine
  );

  const mois = totalEntre(
    debutMois,
    finMois
  );

  const annee = totalEntre(
    debutAnnee,
    finAnnee
  );

  return (
    <>
      <style>{`
        .resume-depenses {
          flex: 0 0 auto;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap:
            clamp(
              6px,
              0.7vw,
              12px
            );

          margin-bottom:
            clamp(
              6px,
              0.7vh,
              11px
            );
        }

        .resume-card {
          min-width: 0;

          background: white;

          border:
            1px solid #e3e7eb;

          border-radius:
            clamp(
              7px,
              0.6vw,
              11px
            );

          padding:
            clamp(
              6px,
              0.8vh,
              11px
            )
            clamp(
              8px,
              1vw,
              16px
            );
        }

        .resume-card-label {
          color: #7b8490;

          font-size:
            clamp(
              8px,
              0.58vw,
              11px
            );

          margin-bottom:
            clamp(
              1px,
              0.3vh,
              4px
            );

          white-space: nowrap;

          overflow: hidden;

          text-overflow:
            ellipsis;
        }

        .resume-card-value {
          color: #19212c;

          font-size:
            clamp(
              14px,
              1.15vw,
              21px
            );

          font-weight: 760;

          letter-spacing:
            -0.4px;

          white-space: nowrap;
        }

        @media (
          max-width: 650px
        ) {
          .resume-depenses {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 6px;
          }

          .resume-card {
            padding:
              7px 9px;
          }

          .resume-card-label {
            font-size: 9px;
          }

          .resume-card-value {
            font-size: 15px;
          }
        }
      `}</style>

      <div className="resume-depenses">
        <div className="resume-card">
          <div className="resume-card-label">
            Cette semaine
          </div>

          <div className="resume-card-value">
            {argent(semaine)}
          </div>
        </div>

        <div className="resume-card">
          <div className="resume-card-label">
            Ce mois
          </div>

          <div className="resume-card-value">
            {argent(mois)}
          </div>
        </div>

        <div className="resume-card">
          <div className="resume-card-label">
            Cette année
          </div>

          <div className="resume-card-value">
            {argent(annee)}
          </div>
        </div>

        <div className="resume-card">
          <div className="resume-card-label">
            Dépenses enregistrées
          </div>

          <div className="resume-card-value">
            {depenses.length}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResumeDepenses;