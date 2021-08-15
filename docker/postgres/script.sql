create SCHEMA if not exists ledger;
create SCHEMA if not exists identity;

CREATE TABLE identity.customer (
   id text not null,
   name text not null,
   email text not null,
   password text not null,
   PRIMARY KEY(id)
);

CREATE TABLE ledger.certificate (
   id text,
   private_key text DEFAULT null,
   cert_body text DEFAULT null,
   customer_id text not null,
   active boolean,
   PRIMARY KEY(id)
);

