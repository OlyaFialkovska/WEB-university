import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, run, get, all } from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCategory(category) {
  return ['Ідея', 'Ціль', 'План', 'Мотивація'].includes(category);
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    gender: row.gender,
    birthDate: row.birth_date,
    registeredAt: row.registered_at,
  };
}

function mapNote(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, gender, birthDate, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !gender || !birthDate || !password) {
      res.status(400).json({ success: false, message: 'Усі поля мають бути заповнені.' });
      return;
    }

    if (String(password).trim().length < 6) {
      res.status(400).json({ success: false, message: 'Пароль має містити щонайменше 6 символів.' });
      return;
    }

    const existingUser = await get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Користувач з таким email уже існує.' });
      return;
    }

    const registeredAt = new Date().toISOString();
    const result = await run(
      `INSERT INTO users (name, email, gender, birth_date, password, registered_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [String(name).trim(), normalizedEmail, gender, birthDate, String(password).trim(), registeredAt],
    );

    const demoNotes = [
      {
        title: 'Список тем для курсової',
        category: 'Ідея',
        description: 'Зібрати варіанти тем і вибрати найцікавішу.',
      },
      {
        title: 'Здати лабораторну на 20',
        category: 'Ціль',
        description: 'Доробити VueJS, сервер і оформити звіт.',
      },
    ];

    for (const note of demoNotes) {
      await run(
        `INSERT INTO notes (user_id, title, category, description, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [result.id, note.title, note.category, note.description, new Date().toISOString()],
      );
    }

    const user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Помилка сервера під час реєстрації.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!user || String(user.password) !== String(password || '').trim()) {
      res.status(401).json({ success: false, message: 'Невірний email або пароль.' });
      return;
    }

    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Помилка сервера під час входу.' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, gender, birth_date, registered_at FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'Користувача не знайдено.' });
      return;
    }

    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося отримати профіль.' });
  }
});

app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const notes = await all('SELECT category FROM notes WHERE user_id = ?', [req.params.id]);
    const stats = {
      total: notes.length,
      goals: notes.filter((note) => note.category === 'Ціль').length,
      plans: notes.filter((note) => note.category === 'План').length,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося отримати статистику.' });
  }
});

app.get('/api/users/:id/notes', async (req, res) => {
  try {
    const { search = '', category = 'Усі' } = req.query;
    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [req.params.id];

    if (category !== 'Усі') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (String(search).trim()) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)';
      const pattern = `%${String(search).trim().toLowerCase()}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY datetime(created_at) DESC, id DESC';

    const notes = await all(sql, params);
    res.json({ success: true, notes: notes.map(mapNote) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося отримати записи.' });
  }
});

app.post('/api/users/:id/notes', async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !description || !validateCategory(category)) {
      res.status(400).json({ success: false, message: 'Некоректні дані запису.' });
      return;
    }

    const createdAt = new Date().toISOString();
    const result = await run(
      `INSERT INTO notes (user_id, title, category, description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, String(title).trim(), category, String(description).trim(), createdAt],
    );

    const note = await get('SELECT * FROM notes WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, note: mapNote(note) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося створити запис.' });
  }
});

app.put('/api/users/:id/notes/:noteId', async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !description || !validateCategory(category)) {
      res.status(400).json({ success: false, message: 'Некоректні дані запису.' });
      return;
    }

    const existing = await get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.noteId, req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Запис не знайдено.' });
      return;
    }

    await run(
      `UPDATE notes
       SET title = ?, category = ?, description = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [String(title).trim(), category, String(description).trim(), new Date().toISOString(), req.params.noteId, req.params.id],
    );

    const note = await get('SELECT * FROM notes WHERE id = ?', [req.params.noteId]);
    res.json({ success: true, note: mapNote(note) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося оновити запис.' });
  }
});

app.delete('/api/users/:id/notes/:noteId', async (req, res) => {
  try {
    const result = await run('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.noteId, req.params.id]);
    if (!result.changes) {
      res.status(404).json({ success: false, message: 'Запис не знайдено.' });
      return;
    }

    res.json({ success: true, message: 'Запис видалено.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Не вдалося видалити запис.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MindVault server started: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Помилка ініціалізації бази даних:', error);
  });
