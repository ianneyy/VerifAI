/* eslint-disable quotes */
import SQLite from 'react-native-sqlite-storage';


SQLite.enablePromise(true);

let db;


const openDB = async () => {
  if (!db) {
    db = await SQLite.openDatabase({
      name: 'factchecker.db',
      location: 'default',
    });
  }

  return db;
};

export const initDB = async () => {
  try {
    console.log('📦 INIT Initializing database...');
    const database = await openDB();

    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS verified (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        claim TEXT,
        source TEXT,
        verdict INTEGER,
        source_score INTEGER,
        writing_style INTEGER,
        matched_article INTEGER,
        matched_person VARCHAR(255),
        face_recognition VARCHAR(255),
        created_at TEXT
      );
    `);
    console.log('🗃️ Table `fact_checks` created or already exists.');

    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS related_news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fact_check_id INTEGER,
        title TEXT,
        url TEXT,
        source TEXT,
        snippet TEXT,
        FOREIGN KEY(fact_check_id) REFERENCES fact_checks(id) ON DELETE CASCADE
      );
    `);
    console.log('🗃️ Table `related_news` created or already exists.');

    console.log('✅ Database and tables ready.');
  } catch (error) {
    console.error('❌ Error initializing:', error?.message || error);
    console.log('🪵 Full error object:', JSON.stringify(error, null, 2));
  }
};

export const insertFactCheck = async fact => {
  const database = await openDB();
  await database.executeSql(
    `INSERT INTO verified 
      (claim, source, verdict, source_score, writing_style, matched_article, matched_person, face_recognition,  created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fact.claim,
      fact.source,
      fact.verdict,
      fact.source_score,
      fact.writing_style,
      fact.matched_article,
      fact.matched_person,
      fact.face_recognition,
      new Date().toISOString(),
    ],
  );
  console.log('✅ Fact-check inserted.');
};
export const insertRelatedNews = async (factCheckId, relatedArticle) => {
  const database = await openDB();
  await database.executeSql(
    `INSERT INTO related_news (fact_check_id, title, url, source, snippet)
     VALUES (?, ?, ?, ?, ?)`,
    [
      factCheckId,
      relatedArticle.title,
      relatedArticle.url,
      relatedArticle.source,
      relatedArticle.snippet,
    ],
  );
};




export const getRelatedNews = async factCheckId => {
  const database = await openDB();
  const [results] = await database.executeSql(
    `SELECT * FROM related_news WHERE fact_check_id = ?`,
    [factCheckId],
  );

  const articles = [];
  for (let i = 0; i < results.rows.length; i++) {
    articles.push(results.rows.item(i));
  }
  return articles;
};




export const getFactCheckByURL = async url => {
  const database = await openDB();
  const [results] = await database.executeSql(
    `SELECT * FROM fact_checks WHERE url = ?`,
    [url],
  );

  if (results.rows.length > 0) {
    return results.rows.item(0);
  } else {
    return null;
  }
};
export const getAllFactChecks = async () => {
  const database = await openDB();
  const [results] = await database.executeSql(`SELECT * FROM verified`);
  const items = [];
  for (let i = 0; i < results.rows.length; i++) {
    items.push(results.rows.item(i));
  }
  return items;
};

