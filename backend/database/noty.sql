USE noty;

CREATE TABLE accounts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

CREATE TABLE sessions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255),
    expires_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE
);

CREATE TABLE folders (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_folder_id INT,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (parent_folder_id) REFERENCES folders (id) ON DELETE CASCADE
);

CREATE TABLE documents (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    folder_id INT,
    title VARCHAR(255) NOT NULL DEFAULT '',
    content LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    CONSTRAINT FOREIGN KEY (owner_id) REFERENCES accounts (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
);

CREATE TABLE tags (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6b8fa8',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
    note_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE versions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    content LONGTEXT NOT NULL,
    version_number INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE
);

CREATE TABLE logs (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note_id INT,
    folder_id INT,
    tag_id INT,
    action VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE SET NULL
);

CREATE TABLE comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    content TEXT NOT NULL,
    anchor_position VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    CONSTRAINT FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE TABLE note_permissions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES accounts (id) ON DELETE CASCADE
);

USE noty;

-- =====================
-- ACCOUNTS
-- =====================
INSERT INTO
    accounts (
        id,
        username,
        email,
        password_hash,
        created_at
    )
VALUES (
        1,
        'marco_rossi',
        'marco.rossi@email.it',
        '$2b$12$abc123hashedpassword1',
        '2024-01-10 09:00:00'
    ),
    (
        2,
        'giulia_bianchi',
        'giulia.bianchi@gmail.com',
        '$2b$12$abc123hashedpassword2',
        '2024-01-15 10:30:00'
    ),
    (
        3,
        'luca_ferrari',
        'luca.ferrari@outlook.com',
        '$2b$12$abc123hashedpassword3',
        '2024-02-01 14:00:00'
    ),
    (
        4,
        'sara_conti',
        'sara.conti@yahoo.it',
        '$2b$12$abc123hashedpassword4',
        '2024-02-20 08:45:00'
    ),
    (
        5,
        'admin_noty',
        'admin@noty.app',
        '$2b$12$abc123hashedpassword5',
        '2024-01-01 00:00:00'
    );

-- =====================
-- FOLDERS
-- =====================
INSERT INTO
    folders (
        id,
        user_id,
        parent_folder_id,
        name,
        created_at
    )
VALUES
    -- Marco's folders
    (
        1,
        1,
        NULL,
        'Lavoro',
        '2024-01-11 09:00:00'
    ),
    (
        2,
        1,
        1,
        'Progetti',
        '2024-01-11 09:05:00'
    ),
    (
        3,
        1,
        1,
        'Riunioni',
        '2024-01-11 09:10:00'
    ),
    (
        4,
        1,
        NULL,
        'Personale',
        '2024-01-12 10:00:00'
    ),
    -- Giulia's folders
    (
        5,
        2,
        NULL,
        'Università',
        '2024-01-16 11:00:00'
    ),
    (
        6,
        2,
        5,
        'Appunti Lezioni',
        '2024-01-16 11:05:00'
    ),
    (
        7,
        2,
        5,
        'Esami',
        '2024-01-16 11:10:00'
    ),
    (
        8,
        2,
        NULL,
        'Ricette',
        '2024-01-17 15:00:00'
    ),
    -- Luca's folders
    (
        9,
        3,
        NULL,
        'Dev Notes',
        '2024-02-02 09:00:00'
    ),
    (
        10,
        3,
        9,
        'Backend',
        '2024-02-02 09:05:00'
    ),
    (
        11,
        3,
        9,
        'Frontend',
        '2024-02-02 09:10:00'
    ),
    -- Sara's folders
    (
        12,
        4,
        NULL,
        'Todo',
        '2024-02-21 08:00:00'
    ),
    (
        13,
        4,
        NULL,
        'Idee',
        '2024-02-21 08:05:00'
    );

-- =====================
-- NOTES
-- =====================
INSERT INTO
    notes (
        id,
        owner_id,
        folder_id,
        title,
        content,
        created_at
    )
VALUES
    -- Marco
    (
        1,
        1,
        2,
        'Progetto Alpha - Overview',
        'Il progetto Alpha mira a digitalizzare il flusso approvazioni interno. Deadline: Q3 2024.',
        '2024-01-13 09:00:00'
    ),
    (
        2,
        1,
        3,
        'Riunione Kick-off 15 Gen',
        'Presenti: Marco, Sara, Giulia. Punti discussi: roadmap, risorse, budget stimato 50k€.',
        '2024-01-15 17:00:00'
    ),
    (
        3,
        1,
        4,
        'Lista della spesa',
        'Latte, pane, pasta, pomodori, olio d\'oliva, vino rosso.',
        '2024-01-20 18:00:00'
    ),
    (
        4,
        1,
        2,
        'Note tecniche - API Gateway',
        '## API Gateway\n\nUsare Kong come gateway. Rate limiting: 100 req/min per utente.',
        '2024-02-01 10:00:00'
    ),
    (
        5,
        1,
        NULL,
        'Idee per il weekend',
        'Gita in montagna, cinema sabato sera, brunch domenica.',
        '2024-02-10 19:00:00'
    ),
    -- Giulia
    (
        6,
        2,
        6,
        'Algoritmi - Lezione 1',
        '## Complessità computazionale\n\nO(1), O(log n), O(n), O(n log n), O(n²). Esempi pratici con bubble sort e merge sort.',
        '2024-01-18 09:30:00'
    ),
    (
        7,
        2,
        6,
        'Database - Lezione 3',
        '## Normalizzazione\n\n1NF, 2NF, 3NF. Chiavi primarie e straniere. Esempio ER diagram.',
        '2024-01-25 11:00:00'
    ),
    (
        8,
        2,
        7,
        'Preparazione Esame Algoritmi',
        'Ripassare: grafi, alberi binari, programmazione dinamica. Esercizi capitoli 4-7.',
        '2024-02-05 14:00:00'
    ),
    (
        9,
        2,
        8,
        'Pasta al Pomodoro',
        '## Ingredienti\n- 400g pasta\n- 500g pomodori pelati\n- Aglio, olio, basilico\n\n## Procedimento\nSoffriggere l\'aglio...',
        '2024-02-08 12:00:00'
    ),
    (
        10,
        2,
        NULL,
        'Libri da leggere',
        '1. Il Nome della Rosa - Eco\n2. 1984 - Orwell\n3. Sapiens - Harari',
        '2024-02-15 20:00:00'
    ),
    -- Luca
    (
        11,
        3,
        10,
        'Setup Docker Compose',
        '```yaml\nversion: "3.8"\nservices:\n  db:\n    image: mysql:8\n    environment:\n      MYSQL_ROOT_PASSWORD: secret\n```',
        '2024-02-03 09:00:00'
    ),
    (
        12,
        3,
        10,
        'Ottimizzazione Query MySQL',
        '## Tips\n- Usare EXPLAIN per analizzare query\n- Indici su colonne usate in WHERE e JOIN\n- Evitare SELECT *',
        '2024-02-05 10:00:00'
    ),
    (
        13,
        3,
        11,
        'React Hooks - Cheatsheet',
        '## useState\n```js\nconst [count, setCount] = useState(0);\n```\n## useEffect\nEseguito dopo ogni render.',
        '2024-02-07 11:00:00'
    ),
    (
        14,
        3,
        11,
        'Tailwind CSS Note',
        'Classi utili: flex, grid, gap-4, p-4, m-2, text-center, font-bold, rounded-lg, shadow-md.',
        '2024-02-12 14:00:00'
    ),
    (
        15,
        3,
        NULL,
        'Libri tecnici consigliati',
        '- Clean Code - Martin\n- The Pragmatic Programmer\n- Designing Data-Intensive Applications',
        '2024-02-20 09:00:00'
    ),
    -- Sara
    (
        16,
        4,
        12,
        'Todo Febbraio',
        '- [ ] Rinnovare abbonamento palestra\n- [ ] Prenotare dentista\n- [x] Pagare bolletta gas',
        '2024-02-21 08:30:00'
    ),
    (
        17,
        4,
        13,
        'Idea App Mobile',
        'App per tracciare abitudini giornaliere. Feature: streak, notifiche, statistiche settimanali.',
        '2024-02-22 10:00:00'
    ),
    (
        18,
        4,
        12,
        'Obiettivi 2024',
        '1. Imparare il giapponese (N5)\n2. Correre una mezza maratona\n3. Leggere 24 libri',
        '2024-02-25 09:00:00'
    );

-- =====================
-- TAGS
-- =====================
INSERT INTO
    tags (
        id,
        user_id,
        name,
        color,
        created_at
    )
VALUES
    -- Marco
    (
        1,
        1,
        'lavoro',
        '#4a90d9',
        '2024-01-11 09:00:00'
    ),
    (
        2,
        1,
        'urgente',
        '#e74c3c',
        '2024-01-11 09:01:00'
    ),
    (
        3,
        1,
        'personale',
        '#27ae60',
        '2024-01-11 09:02:00'
    ),
    -- Giulia
    (
        4,
        2,
        'università',
        '#8e44ad',
        '2024-01-16 11:00:00'
    ),
    (
        5,
        2,
        'esame',
        '#e67e22',
        '2024-01-16 11:01:00'
    ),
    (
        6,
        2,
        'cucina',
        '#1abc9c',
        '2024-01-16 11:02:00'
    ),
    -- Luca
    (
        7,
        3,
        'dev',
        '#2c3e50',
        '2024-02-02 09:00:00'
    ),
    (
        8,
        3,
        'backend',
        '#3498db',
        '2024-02-02 09:01:00'
    ),
    (
        9,
        3,
        'frontend',
        '#e91e63',
        '2024-02-02 09:02:00'
    ),
    (
        10,
        3,
        'reference',
        '#f39c12',
        '2024-02-02 09:03:00'
    ),
    -- Sara
    (
        11,
        4,
        'todo',
        '#95a5a6',
        '2024-02-21 08:00:00'
    ),
    (
        12,
        4,
        'idee',
        '#f1c40f',
        '2024-02-21 08:01:00'
    ),
    (
        13,
        4,
        'obiettivi',
        '#2ecc71',
        '2024-02-21 08:02:00'
    );

-- =====================
-- NOTE_TAGS
-- =====================
INSERT INTO
    note_tags (note_id, tag_id)
VALUES
    -- Marco's notes
    (1, 1),
    (1, 2), -- Progetto Alpha: lavoro + urgente
    (2, 1), -- Riunione: lavoro
    (3, 3), -- Lista spesa: personale
    (4, 1),
    (4, 2), -- API Gateway: lavoro + urgente
    (5, 3), -- Weekend: personale
    -- Giulia's notes
    (6, 4), -- Algoritmi: università
    (7, 4), -- Database: università
    (8, 4),
    (8, 5), -- Preparazione esame: università + esame
    (9, 6), -- Pasta: cucina
    -- Luca's notes
    (11, 7),
    (11, 8), -- Docker: dev + backend
    (12, 7),
    (12, 8), -- MySQL: dev + backend
    (13, 7),
    (13, 9), -- React: dev + frontend
    (14, 7),
    (14, 9),
    (14, 10), -- Tailwind: dev + frontend + reference
    (15, 10), -- Libri: reference
    -- Sara's notes
    (16, 11), -- Todo: todo
    (17, 12), -- Idea app: idee
    (18, 13);
-- Obiettivi: obiettivi

-- =====================
-- VERSIONS
-- =====================
INSERT INTO
    versions (
        id,
        note_id,
        user_id,
        content,
        version_number,
        created_at
    )
VALUES (
        1,
        1,
        1,
        'Il progetto Alpha mira a digitalizzare il flusso approvazioni.',
        1,
        '2024-01-13 09:00:00'
    ),
    (
        2,
        1,
        1,
        'Il progetto Alpha mira a digitalizzare il flusso approvazioni interno.',
        2,
        '2024-01-14 10:00:00'
    ),
    (
        3,
        1,
        1,
        'Il progetto Alpha mira a digitalizzare il flusso approvazioni interno. Deadline: Q3 2024.',
        3,
        '2024-01-15 11:00:00'
    ),
    (
        4,
        4,
        1,
        '## API Gateway\n\nValutare Kong o AWS API Gateway.',
        1,
        '2024-02-01 10:00:00'
    ),
    (
        5,
        4,
        1,
        '## API Gateway\n\nUsare Kong come gateway. Rate limiting: 100 req/min per utente.',
        2,
        '2024-02-02 09:00:00'
    ),
    (
        6,
        6,
        2,
        '## Complessità computazionale\n\nO(1), O(log n), O(n).',
        1,
        '2024-01-18 09:30:00'
    ),
    (
        7,
        6,
        2,
        '## Complessità computazionale\n\nO(1), O(log n), O(n), O(n log n), O(n²). Esempi pratici con bubble sort e merge sort.',
        2,
        '2024-01-19 10:00:00'
    ),
    (
        8,
        12,
        3,
        '## Tips\n- Usare EXPLAIN per analizzare query',
        1,
        '2024-02-05 10:00:00'
    ),
    (
        9,
        12,
        3,
        '## Tips\n- Usare EXPLAIN per analizzare query\n- Indici su colonne usate in WHERE e JOIN',
        2,
        '2024-02-06 09:00:00'
    ),
    (
        10,
        12,
        3,
        '## Tips\n- Usare EXPLAIN per analizzare query\n- Indici su colonne usate in WHERE e JOIN\n- Evitare SELECT *',
        3,
        '2024-02-07 08:00:00'
    );

-- =====================
-- NOTE_PERMISSIONS (shared notes)
-- =====================
INSERT INTO
    note_permissions (
        id,
        note_id,
        user_id,
        role,
        created_at
    )
VALUES (
        1,
        1,
        1,
        'owner',
        '2024-01-13 09:00:00'
    ), -- Marco owner di Progetto Alpha
    (
        2,
        1,
        4,
        'editor',
        '2024-01-14 10:00:00'
    ), -- Sara può editare Progetto Alpha
    (
        3,
        1,
        2,
        'viewer',
        '2024-01-14 10:05:00'
    ), -- Giulia può vedere Progetto Alpha
    (
        4,
        2,
        1,
        'owner',
        '2024-01-15 17:00:00'
    ), -- Marco owner della nota riunione
    (
        5,
        2,
        4,
        'editor',
        '2024-01-15 17:10:00'
    ), -- Sara può editare la nota riunione
    (
        6,
        11,
        3,
        'owner',
        '2024-02-03 09:00:00'
    ), -- Luca owner di Docker Compose
    (
        7,
        11,
        1,
        'viewer',
        '2024-02-04 09:00:00'
    ), -- Marco può vedere Docker Compose
    (
        8,
        7,
        2,
        'owner',
        '2024-01-25 11:00:00'
    ), -- Giulia owner della nota Database
    (
        9,
        7,
        3,
        'viewer',
        '2024-01-26 09:00:00'
    );
-- Luca può vedere la nota Database

-- =====================
-- COMMENTS
-- =====================
INSERT INTO
    comments (
        id,
        note_id,
        user_id,
        parent_comment_id,
        content,
        anchor_position,
        created_at
    )
VALUES (
        1,
        1,
        4,
        NULL,
        'Ho aggiunto i dettagli sul budget, puoi rivedere?',
        NULL,
        '2024-01-14 11:00:00'
    ),
    (
        2,
        1,
        1,
        1,
        'Perfetto, ho visto. Aggiorno anche la timeline.',
        NULL,
        '2024-01-14 12:00:00'
    ),
    (
        3,
        1,
        2,
        NULL,
        'Dove possiamo trovare la documentazione tecnica?',
        NULL,
        '2024-01-15 09:00:00'
    ),
    (
        4,
        1,
        1,
        3,
        'La metto nella cartella Progetti su Confluence.',
        NULL,
        '2024-01-15 10:00:00'
    ),
    (
        5,
        2,
        4,
        NULL,
        'Manca il punto sulle scadenze intermedie.',
        'p:3',
        '2024-01-16 08:00:00'
    ),
    (
        6,
        2,
        1,
        5,
        'Hai ragione, aggiungo subito.',
        'p:3',
        '2024-01-16 09:00:00'
    ),
    (
        7,
        6,
        2,
        NULL,
        'Ripassare anche il quicksort per l\'esame!',
        NULL,
        '2024-01-20 15:00:00'
    ),
    (
        8,
        11,
        1,
        NULL,
        'Ottima configurazione, la uso anche io per il mio progetto.',
        NULL,
        '2024-02-04 10:00:00'
    ),
    (
        9,
        11,
        3,
        8,
        'Grazie! Se hai bisogno aggiungo anche il servizio Redis.',
        NULL,
        '2024-02-04 11:00:00'
    ),
    (
        10,
        12,
        1,
        NULL,
        'Aggiungerei anche un paragrafo sulla query cache.',
        NULL,
        '2024-02-08 09:00:00'
    );

-- =====================
-- LOGS
-- =====================
INSERT INTO
    logs (
        id,
        user_id,
        note_id,
        folder_id,
        tag_id,
        action,
        created_at
    )
VALUES (
        1,
        1,
        1,
        NULL,
        NULL,
        'note_created',
        '2024-01-13 09:00:00'
    ),
    (
        2,
        1,
        1,
        NULL,
        NULL,
        'note_updated',
        '2024-01-14 10:00:00'
    ),
    (
        3,
        1,
        1,
        NULL,
        NULL,
        'note_shared',
        '2024-01-14 10:05:00'
    ),
    (
        4,
        1,
        NULL,
        1,
        NULL,
        'folder_created',
        '2024-01-11 09:00:00'
    ),
    (
        5,
        1,
        NULL,
        2,
        NULL,
        'folder_created',
        '2024-01-11 09:05:00'
    ),
    (
        6,
        2,
        6,
        NULL,
        NULL,
        'note_created',
        '2024-01-18 09:30:00'
    ),
    (
        7,
        2,
        6,
        NULL,
        NULL,
        'note_updated',
        '2024-01-19 10:00:00'
    ),
    (
        8,
        2,
        8,
        NULL,
        NULL,
        'note_created',
        '2024-02-05 14:00:00'
    ),
    (
        9,
        3,
        11,
        NULL,
        NULL,
        'note_created',
        '2024-02-03 09:00:00'
    ),
    (
        10,
        3,
        11,
        NULL,
        NULL,
        'note_shared',
        '2024-02-04 09:00:00'
    ),
    (
        11,
        3,
        12,
        NULL,
        NULL,
        'note_created',
        '2024-02-05 10:00:00'
    ),
    (
        12,
        3,
        12,
        NULL,
        NULL,
        'note_updated',
        '2024-02-06 09:00:00'
    ),
    (
        13,
        3,
        12,
        NULL,
        NULL,
        'note_updated',
        '2024-02-07 08:00:00'
    ),
    (
        14,
        4,
        16,
        NULL,
        NULL,
        'note_created',
        '2024-02-21 08:30:00'
    ),
    (
        15,
        4,
        17,
        NULL,
        NULL,
        'note_created',
        '2024-02-22 10:00:00'
    ),
    (
        16,
        1,
        NULL,
        NULL,
        1,
        'tag_created',
        '2024-01-11 09:00:00'
    ),
    (
        17,
        2,
        NULL,
        NULL,
        4,
        'tag_created',
        '2024-01-16 11:00:00'
    ),
    (
        18,
        3,
        NULL,
        NULL,
        7,
        'tag_created',
        '2024-02-02 09:00:00'
    ),
    (
        19,
        4,
        18,
        NULL,
        NULL,
        'note_created',
        '2024-02-25 09:00:00'
    ),
    (
        20,
        1,
        5,
        NULL,
        NULL,
        'note_created',
        '2024-02-10 19:00:00'
    );