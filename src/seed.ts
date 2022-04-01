import axios from 'axios';
import cheerio from 'cheerio';
import mysql from 'mysql';

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: 'y978vzoi3rp1',
  password: 'pscale_pw_Kz3w6XVpjmwKdwJ6bh9ukyutk0MlrrfjVEQgxvxmzkI',
  database: process.env.db,
  ssl: {},
});
connection.connect();

const getCharacterPageNames = async () => {
  const url = 'https://jujutsu-kaisen.fandom.com/wiki/Category:Characters';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const categories = $('ul.category-page__members-for-char');

  const characterPageNames = [];
  for (let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const charactersLIs = $(ul).find('li.category-page__member');
    for (let j = 0; j < charactersLIs.length; j++) {
      const li = charactersLIs[j];
      const path =
        $(li).find('a.category-page__member-link').attr('href') || '';
      const name = path.replace('/wiki/', '');
      characterPageNames.push(name);
    }
  }

  return characterPageNames;
};

const getCharacterInfo = async (characterName: string) => {
  const { data } = await axios.get(
    `https://jujutsu-kaisen.fandom.com/wiki/${characterName}`
  );
  const $ = cheerio.load(data);
  let name = $('h2[data-source="name"]').text();
  const species = $(
    'div[data-source="race"] > div.pi-data-value.pi-font'
  ).text();
  const grade = $(
    'div[data-source="class"] > div.pi-data-value.pi-font'
  ).text();
  const affiliation = $(
    'div[data-source="affiliation"] > div.pi-data-value.pi-font'
  ).text();
  const image = $('.image.image-thumbnail > img').attr('src');
  if (!name) {
    const parts = characterName.split('/');
    const last = parts[parts.length - 1];
    name = last.replace('_', ' ');
  }
  const characterInfo = {
    name,
    species,
    grade,
    affiliation,
    image,
  };
  return characterInfo;
};

const loadCharacters = async () => {
  let characterPageNames = await getCharacterPageNames();
  const characterInfoPromises = characterPageNames.map((characterName) =>
    getCharacterInfo(characterName)
  );
  const characters = await Promise.all(characterInfoPromises);

  const values = characters.map((character, i) => [
    i,
    character.name,
    character.species,
    character.grade,
    character.affiliation,
    character.image,
  ]);
  console.log(values);
  const sql =
    'INSERT INTO Characters (id, name, species, Grade, affiliation, image) VALUES ?';
  connection.query(sql, [values], (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('muri muri muri muri......');
  });
};

loadCharacters();
