# Update the Exoplanet Database

> NOTE: You need the sqlite3 CLI installed, it is required to generate the SQLite database.

- Download the entire CSV of confirmed exoplanets from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) to `data/exoplanets.csv`

- Remove the metadata at the top of the CSV file (lines beginning with a `#`).

- Run `npm run db:gen` or `bun db:gen`, depending on your Javascript runtime/package manager.

- Remove duplicate entries in the database by running the SQL file in `scripts/remove_dupe_data.sql` on the database
  ```
  $ sqlite3 public/exoplanets.db < scripts/remove_dupe_data.sql
  ```
