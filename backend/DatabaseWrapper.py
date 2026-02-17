import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseWrapper:

    def __init__(self):
        self.db_config = {
            'host': os.getenv("DB_HOST"),
            'user': os.getenv("DB_USER"),
            'password': os.getenv("DB_PASSWORD"),
            'database': os.getenv("DB_NAME"),
            'port': int(os.getenv("DB_PORT")),
            'cursorclass': pymysql.cursors.DictCursor
        }
        self.create_tables()

    def connect(self):
        return pymysql.connect(**self.db_config)

    def execute_query(self, query, params=()):
        conn = self.connect()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()
        conn.close()

    def fetch_query(self, query, params=()):
        conn = self.connect()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchall()
        conn.close()
        return result

    # ================== TABELLE ==================

    def create_tables(self):
        self.execute_query("""
            CREATE TABLE IF NOT EXISTS Tavoli (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codice VARCHAR(10) UNIQUE NOT NULL
            )
        """)

        self.execute_query("""
            CREATE TABLE IF NOT EXISTS Categorie (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(50) NOT NULL
            )
        """)

        self.execute_query("""
            CREATE TABLE IF NOT EXISTS Prodotti (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                prezzo DECIMAL(6,2) NOT NULL,
                immagine VARCHAR(255),
                categoria_id INT,
                FOREIGN KEY (categoria_id) REFERENCES Categorie(id)
            )
        """)

        self.execute_query("""
            CREATE TABLE IF NOT EXISTS Ordini (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tavolo_id INT,
                nome_cliente VARCHAR(50),
                stato VARCHAR(20) DEFAULT 'in_attesa',
                FOREIGN KEY (tavolo_id) REFERENCES Tavoli(id)
            )
        """)

        self.execute_query("""
            CREATE TABLE IF NOT EXISTS RigheOrdine (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ordine_id INT,
                prodotto_id INT,
                quantita INT,
                FOREIGN KEY (ordine_id) REFERENCES Ordini(id),
                FOREIGN KEY (prodotto_id) REFERENCES Prodotti(id)
            )
        """)

    # ================== TAVOLI ==================

    def get_or_create_tavolo(self, codice):
        tavolo = self.fetch_query(
            "SELECT * FROM Tavoli WHERE codice=%s", (codice,)
        )
        if tavolo:
            return tavolo[0]["id"]

        self.execute_query(
            "INSERT INTO Tavoli (codice) VALUES (%s)", (codice,)
        )
        return self.fetch_query(
            "SELECT id FROM Tavoli WHERE codice=%s", (codice,)
        )[0]["id"]

    # ================== MENU ==================

    def get_menu(self):
        return self.fetch_query("""
            SELECT Prodotti.id, Prodotti.nome, Prodotti.prezzo,
                   Prodotti.immagine, Categorie.nome AS categoria
            FROM Prodotti
            JOIN Categorie ON Prodotti.categoria_id = Categorie.id
        """)

    def aggiungi_categoria(self, nome):
        self.execute_query(
            "INSERT INTO Categorie (nome) VALUES (%s)", (nome,)
        )

    def aggiungi_prodotto(self, nome, prezzo, immagine, categoria_id):
        self.execute_query("""
            INSERT INTO Prodotti (nome, prezzo, immagine, categoria_id)
            VALUES (%s, %s, %s, %s)
        """, (nome, prezzo, immagine, categoria_id))

    # ================== ORDINI ==================

    def crea_ordine(self, codice_tavolo, nome_cliente, prodotti):
        tavolo_id = self.get_or_create_tavolo(codice_tavolo)

        self.execute_query("""
            INSERT INTO Ordini (tavolo_id, nome_cliente)
            VALUES (%s, %s)
        """, (tavolo_id, nome_cliente))

        ordine_id = self.fetch_query(
            "SELECT LAST_INSERT_ID() AS id"
        )[0]["id"]

        for p in prodotti:
            self.execute_query("""
                INSERT INTO RigheOrdine (ordine_id, prodotto_id, quantita)
                VALUES (%s, %s, %s)
            """, (ordine_id, p["prodotto_id"], p["quantita"]))

        return ordine_id

    def get_ordini_by_tavolo(self, codice):
        return self.fetch_query("""
            SELECT Ordini.id, Ordini.nome_cliente, Ordini.stato,
                   Prodotti.nome, RigheOrdine.quantita
            FROM Ordini
            JOIN Tavoli ON Ordini.tavolo_id = Tavoli.id
            JOIN RigheOrdine ON Ordini.id = RigheOrdine.ordine_id
            JOIN Prodotti ON RigheOrdine.prodotto_id = Prodotti.id
            WHERE Tavoli.codice=%s
        """, (codice,))

    def aggiorna_stato_ordine(self, ordine_id, stato):
        self.execute_query("""
            UPDATE Ordini SET stato=%s WHERE id=%s
        """, (stato, ordine_id))
