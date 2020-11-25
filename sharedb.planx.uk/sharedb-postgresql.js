const { Pool } = require("pg");
const { DB } = require("sharedb");

const [OPS_TABLE, DATA_TABLE] = ["operations", "flows"];

function PostgresDB(options) {
  if (!(this instanceof PostgresDB)) {
    return new PostgresDB(options);
  }

  DB.call(this, options);
  this.closed = false;
  this.pool = new Pool(options);
}

PostgresDB.prototype = Object.create(DB.prototype);

PostgresDB.prototype.close = function (callback) {
  this.closed = true;
  this.pool.end();
  if (callback) {
    callback();
  }
};

function rollback(client, done) {
  client.query("ROLLBACK", (err) => done(err));
}

// Persists an op and snapshot if it is for the next version. Calls back with
// callback(err, succeeded)
PostgresDB.prototype.commit = function (
  _collection,
  id,
  op,
  snapshot,
  _options,
  callback
) {
  const { uId: actorId } = op.m;

  /*
   * op: CreateOp {
   *   src: '24545654654646',
   *   seq: 1,
   *   v: 0,
   *   create: { type: 'http://sharejs.org/types/JSONv0', data: { ... } },
   *   m: { ts: 12333456456 } }
   * }
   * snapshot: PostgresSnapshot
   */
  this.pool.connect((err, client, done) => {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    function commit() {
      client.query("COMMIT", (err) => {
        done(err);
        if (err) {
          callback(err);
        } else {
          callback(null, true);
        }
      });
    }

    // START  ------------------------------------------------------------
    client.query(
      `SELECT max(version) AS max_version FROM ${OPS_TABLE} WHERE flow_id = $1`,
      [id],
      (err, res) => {
        let max_version = res.rows[0].max_version;
        if (max_version == null) {
          max_version = 0;
        }
        if (snapshot.v !== max_version + 1) {
          return callback(null, false);
        }

        client.query("BEGIN", (err) => {
          client.query(
            `INSERT INTO ${DATA_TABLE} (id, slug) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, id],
            (err, _res) => {
              if (err) {
                rollback(client, done);
                callback(err);
                return;
              }

              client.query(
                `INSERT INTO ${OPS_TABLE} (flow_id, version, data, actor_id) VALUES ($1, $2, $3, $4)`,
                [id, snapshot.v, op, actorId],
                (err, _res) => {
                  if (err) {
                    // TODO: if err is "constraint violation", callback(null, false) instead
                    rollback(client, done);
                    callback(err);
                    return;
                  }
                  if (snapshot.v === 1) {
                    client.query(
                      `UPDATE ${DATA_TABLE} SET version = $1, data = $2 WHERE id = $3`,
                      [snapshot.v, snapshot.data, id],
                      (err, _res) => {
                        // TODO:
                        // if the insert was successful and did insert, callback(null, true)
                        // if the insert was successful and did not insert, callback(null, false)
                        // if there was an error, rollback and callback(error)
                        if (err) {
                          rollback(client, done);
                          callback(err);
                          return;
                        }
                        commit();
                      }
                    );
                  } else {
                    client.query(
                      `UPDATE ${DATA_TABLE} SET version = $2, data = $3 WHERE id = $1 AND version = ($2 - 1)`,
                      [id, snapshot.v, snapshot.data],
                      (err, _res) => {
                        // TODO:
                        // if any rows were updated, success
                        // if 0 rows were updated, rollback and not success
                        // if error, rollback and not success
                        if (err) {
                          rollback(client, done);
                          callback(err);
                          return;
                        }
                        commit();
                      }
                    );
                  }
                }
              );
            }
          );
        });
      }
    );
  });
};

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
PostgresDB.prototype.getSnapshot = function (
  _collection,
  id,
  _fields,
  _options,
  callback
) {
  this.pool.connect((err, client, done) => {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    client.query(
      `SELECT version, data FROM ${DATA_TABLE} WHERE id = $1 LIMIT 1`,
      [id],
      (err, res) => {
        done();
        if (err) {
          callback(err);
          return;
        }

        let snapshot;

        if (res.rows.length && res.rows[0].version) {
          const row = res.rows[0];
          snapshot = new PostgresSnapshot(
            id,
            row.version,
            "http://sharejs.org/types/JSONv0",
            row.data,
            undefined // TODO: metadata
          );
        } else {
          snapshot = new PostgresSnapshot(id, 0, null, undefined, undefined);
        }

        callback(null, snapshot);
      }
    );
  });
};

// Get OPS_TABLE between [from, to) noninclusively. (Ie, the range should
// contain start but not end).
//
// If end is null, this function should return all OPS_TABLE from start onwards.
//
// The OPS_TABLE that getOps returns don't need to have a version: field.
// The version will be inferred from the parameters if it is missing.
//
// Callback should be called as callback(error, [list of ops]);
PostgresDB.prototype.getOps = function (
  _collection,
  id,
  from,
  to,
  _options,
  callback
) {
  this.pool.connect((err, client, done) => {
    if (err) {
      done(client);
      callback(err);
      return;
    }
    client.query(
      `SELECT version, data FROM ${OPS_TABLE} WHERE flow_id = $1 AND version >= $2 AND version < $3`,
      [id, from, to],
      (err, res) => {
        done();
        if (err) {
          callback(err);
          return;
        }
        callback(
          null,
          res.rows.map((row) => {
            return row.data;
          })
        );
      }
    );
  });
};

function PostgresSnapshot(id, version, type, data, meta) {
  this.id = id;
  this.v = version;
  this.type = type;
  this.data = data;
  this.m = meta;
}

module.exports = PostgresDB;
