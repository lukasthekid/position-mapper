

CREATE TABLE IF NOT EXISTS zug(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    typ VARCHAR(255),
    ziel VARCHAR(255)

);

CREATE TABLE IF NOT EXISTS zug_position(
    zug_id int PRIMARY KEY,
    lat NUMERIC NOT NULL,
    long NUMERIC NOT NULL,
    timestamp int NOT NULL,
    FOREIGN KEY (zug_id) REFERENCES zug(id)

);