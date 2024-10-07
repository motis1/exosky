DELETE FROM exoplanets
    WHERE rowid NOT IN (
        SELECT MAX(rowid)
        FROM exoplanets
        GROUP BY pl_name
        HAVING MAX(rowupdate)
    );