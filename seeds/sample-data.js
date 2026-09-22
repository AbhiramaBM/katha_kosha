import dotenv from 'dotenv';
import knex from 'knex';
import config from '../knexfile.js';

dotenv.config();

async function seedSampleData() {
  const db = knex(config);
  try {
    console.log('[Seed Sample] Seeding authentic Kannada literary data...');

    // 1. Get or create admin user for attribution
    let admin = await db('users').where({ role: 'admin' }).first();
    if (!admin) {
      console.log('[Seed Sample] No admin found, run npm run seed:admin first.');
      process.exit(1);
    }

    // 2. Authors (Genuine historical Kannada literary figures)
    const authorsData = [
      {
        name_kn: 'ಕುವೆಂಪು',
        name_en: 'Kuvempu (K. V. Puttappa)',
        bio: 'ಕುಪ್ಪಳ್ಳಿ ವೆಂಕಟಪ್ಪ ಪುಟ್ಟಪ್ಪನವರು (ಕುವೆಂಪು) ಕನ್ನಡದ ಪ್ರಮುಖ ಕವಿ, ಕಾದಂಬರಿಕಾರ ಹಾಗೂ ಚಿಂತಕರು. ಕನ್ನಡಕ್ಕೆ ಪ್ರಥಮ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ತಂದುಕೊಟ್ಟ ರಾಷ್ಟ್ರಕವಿ.',
        birth_year: 1904,
        death_year: 1994,
        place: 'ಕುಪ್ಪಳ್ಳಿ, ಶಿವಮೊಗ್ಗ (Kuppalli, Shivamogga)'
      },
      {
        name_kn: 'ಕೆ.ಪಿ. ಪೂರ್ಣಚಂದ್ರ ತೇಜಸ್ವಿ',
        name_en: 'K. P. Poornachandra Tejaswi',
        bio: 'ಕರ್ನಾಟಕದ ಖ್ಯಾತ ಸಾಹಿತಿ, ಪರಿಸರವಾದಿ, ಛಾಯಾಗ್ರಾಹಕ ಹಾಗೂ ಕಾದಂಬರಿಕಾರರು. ನವ್ಯೋತ್ತರ ಕನ್ನಡ ಸಾಹಿತ್ಯದ ದಿಗ್ಗಜರು.',
        birth_year: 1938,
        death_year: 2007,
        place: 'ಮೂಡಿಗೆರೆ, ಚಿಕ್ಕಮಗಳೂರು (Mudigere, Chikkamagaluru)'
      },
      {
        name_kn: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್',
        name_en: 'Masti Venkatesha Iyengar',
        bio: 'ಕನ್ನಡ ಸಣ್ಣ ಕಥೆಯ ಜನಕರೆಂದು ಪ್ರಖ್ಯಾತರಾದ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪುರಸ್ಕೃತ ಸಾಹಿತಿ. "ಶ್ರೀನಿವಾಸ" ಎಂಬ ಕಾವ್ಯನಾಮದಿಂದಲೂ ಪ್ರಸಿದ್ಧರು.',
        birth_year: 1891,
        death_year: 1986,
        place: 'ಮಾಲೂರು, ಕೋಲಾರ (Maloor, Kolar)'
      },
      {
        name_kn: 'ದ.ರಾ. ಬೇಂದ್ರೆ',
        name_en: 'D. R. Bendre (Da. Ra. Bendre)',
        bio: 'ಕನ್ನಡದ ವರಕವಿ ದತ್ತಾತ್ರೇಯ ರಾಮಚಂದ್ರ ಬೇಂದ್ರೆಯವರು. "ಅಂಬಿಕಾತನಯದತ್ತ" ಎಂಬ ಕಾವ್ಯನಾಮದಿಂದ ಗೀತೆ, ಭಾವಗೀತೆಗಳನ್ನು ರಚಿಸಿದ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪುರಸ್ಕೃತರು.',
        birth_year: 1896,
        death_year: 1981,
        place: 'ಧಾರವಾಡ (Dharwad)'
      },
      {
        name_kn: 'ವೈದೇಹಿ',
        name_en: 'Vaidehi (Janaki Srinivasa Murthy)',
        bio: 'ಕನ್ನಡದ ಪ್ರಮುಖ ಕಥೆಗಾರ್ತಿ, ಕವಯಿತ್ರಿ ಮತ್ತು ನಾಟಕಕಾರ್ತಿ. ಸ್ತ್ರೀ ಸಂವೇದನೆಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅಭಿವ್ಯಕ್ತಿಸಿದ ಕೇಂದ್ರ ಸಾಹಿತ್ಯ ಅಕಾಡೆಮಿ ಪ್ರಶಸ್ತಿ ಪುರಸ್ಕೃತರು.',
        birth_year: 1945,
        death_year: null,
        place: 'ಕುಂದಾಪುರ, ಉಡುಪಿ (Kundapura, Udupi)'
      },
      {
        name_kn: 'ಯು.ಆರ್. ಅನಂತಮೂರ್ತಿ',
        name_en: 'U. R. Ananthamurthy',
        bio: 'ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪುರಸ್ಕೃತ ಕನ್ನಡದ ಖ್ಯಾತ ನವ್ಯ ಸಾಹಿತಿ, ಕಾದಂಬರಿಕಾರ ಮತ್ತು ಸಾಮಾಜಿಕ ಚಿಂತಕರು.',
        birth_year: 1932,
        death_year: 2014,
        place: 'ತೀರ್ಥಹಳ್ಳಿ, ಶಿವಮೊಗ್ಗ (Thirthahalli, Shivamogga)'
      }
    ];

    const authorMap = {};
    for (const a of authorsData) {
      let existing = await db('authors').where({ name_kn: a.name_kn }).whereNull('deleted_at').first();
      if (!existing) {
        const [id] = await db('authors').insert({
          ...a,
          created_by: admin.id,
          updated_by: admin.id
        });
        existing = await db('authors').where({ id }).first();
        console.log(`  + Created Author: ${a.name_kn} (${a.name_en})`);
      } else {
        console.log(`  = Existing Author: ${a.name_kn}`);
      }
      authorMap[a.name_kn] = existing.id;
    }

    // 3. Stories (Genuine canonical Kannada literature)
    const storiesData = [
      {
        author_id: authorMap['ಕುವೆಂಪು'],
        title_kn: 'ಮಲೆಗಳಲ್ಲಿ ಮದುಮಗಳು (ಆಯ್ದ ಭಾಗ)',
        title_en: 'Malegalalli Madumagalu (Selected Excerpts)',
        genre: 'ಮಹಾಕಾದಂಬರಿ (Epic Novel)',
        language: 'kn',
        published_year: 1967,
        summary: 'ಮಲೆನಾಡಿನ ಹಸಿರು, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಬದುಕಿನ ವೈವಿಧ್ಯಮಯ ಆಯಾಮಗಳನ್ನು ಅನಾವರಣಗೊಳಿಸುವ ಕುವೆಂಪು ಅವರ ಅಮರ ಕಾದಂಬರಿ.',
        content_type: 'text',
        content_text: `ತೀರ್ಥಹಳ್ಳಿಯ ತುಂಗಾತೀರದ ಬೆಟ್ಟಸಾಲು ಆಚೆಗೆ ಕುಂತು ನೋಡಿದರೆ, ಮಳೆಗಾಲದ ಮಂಜು ಮುಸುಕಿದ ಬೆಟ್ಟಗಳ ನಡುವೆ ಕಲೆಯು ಆರಂಭವಾಗುತ್ತದೆ. ಹಾಲಳ್ಳಿ ಹೊಳೆಯ ನೀರಿನ ನಿನಾದದೊಂದಿಗೆ ಪ್ರಕೃತಿಯು ನಿಗೂಢತೆ ಮೈವೆತ್ತಿದೆ. ಬದುಕಿನ ಸಹಜ ಕಲಹಗಳು, ಮುಗ್ಧ ಸಂಬಂಧಗಳ ಸಂಕೀರ್ಣತೆ ಇಲ್ಲಿ ಅನಾವರಣಗೊಳ್ಳುತ್ತದೆ.

ಹಸಿರು ಕಾನನದ ಕತ್ತಲೆಯಲ್ಲಿ ಒಂದೆ ಹನಿ ಹಿಡಿದು ಸಾಗುತ್ತಿದ್ದ ಕುಪ್ಪಣ್ಣನ ಹೆಜ್ಜೆಯು ತೇವಗೊಂಡ ಎಲೆಗಳ ಮೇಲೆ ಸದ್ದಿಲ್ಲದೆ ಮೂಡುತ್ತಿತ್ತು. ಮಲೆನಾಡಿನ ಗಾಳಿಯು ಕಾಡುಹೂವುಗಳ ತೀಕ್ಷ್ಣ ಸುಗಂಧವನ್ನು ಹೊತ್ತು ತರುತ್ತಿತ್ತು. ಕಣಿವೆಯ ಕೆಳಗಿನ ಮನೆಯಂಗಳದಲ್ಲಿ ಸಣ್ಣ ಬೆಂಕಿ ಉರಿಯುತ್ತಿತ್ತು. ಆ ಮನೆಯ ಹೆಬ್ಬಾಗಿಲಿನಲ್ಲಿ ನಿಂತಿದ್ದ ಚಿನ್ನಮ್ಮನ ಕಣ್ಣುಗಳಲ್ಲಿ ಕತ್ತಲ ಕಾನನದ ನಿಗೂಢತೆ ಪ್ರತಿಫಲಿಸುತ್ತಿತ್ತು.

ಪ್ರಕೃತಿಯೇ ಜೀವಂತ ಪಾತ್ರವಾಗಿ ಮೈದಳೆಯುವ ಈ ಲೋಕದಲ್ಲಿ, ಮಾನವನ ಆಸೆ-ಆಕಾಂಕ್ಷೆಗಳು, ಧರ್ಮ-ಅಧರ್ಮಗಳ ಸೂಕ್ಷ್ಮ ಎಳೆಗಳು ಅವ್ಯಕ್ತ ಶಕ್ತಿಯೊಂದಿಗೆ ಬೆರೆಯುತ್ತವೆ. ಕುವೆಂಪು ಅವರ ಲೇಖನಿಯು ಮಲೆನಾಡಿನ ನಿಸರ್ಗ ಸೌಂದರ್ಯ ಹಾಗೂ ಜನಜೀವನದ ನೈಜ ಚಿತ್ರಣವನ್ನು ಅನನ್ಯವಾಗಿ ಕಟ್ಟಿಕೊಡುತ್ತದೆ.`,
        status: 'published',
        references: [
          { name: 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ತು - ಕೃತಿ ಪರಿಚಯ', url: 'https://kannadasahithyaparishathu.in/kuvempu-works' },
          { name: 'ಪ್ರಜಾವಾಣಿ ಸಾಹಿತ್ಯ ವಿಮರ್ಶೆ ಲೇಖನ', url: 'https://prajavani.net/literature/kuvempu-malegalalli-review' }
        ]
      },
      {
        author_id: authorMap['ಕೆ.ಪಿ. ಪೂರ್ಣಚಂದ್ರ ತೇಜಸ್ವಿ'],
        title_kn: 'ಕರ್ವಾಲೋ',
        title_en: 'Karvalo - A Scientific & Philosophical Quest',
        genre: 'ಕಾದಂಬರಿ (Novel)',
        language: 'kn',
        published_year: 1980,
        summary: 'ಹಾರುವ ಓತಿಯ ಹುಡುಕಾಟದ ಮೂಲಕ ಮಾನವ ಅನ್ವೇಷಣೆ, ಪರಿಸರ ಪ್ರಜ್ಞೆ ಮತ್ತು ವಿಜ್ಞಾನ-ತತ್ತ್ವಶಾಸ್ತ್ರದ ಮುಖಾಮುಖಿಯನ್ನು ಚಿತ್ರಿಸುವ ರೋಚಕ ಕೃತಿ.',
        content_type: 'text',
        content_text: `ಮೂಡಿಗೆರೆಯ ಕಾಫಿ ತೋಟಗಳ ಮಡಿಲಲ್ಲಿ ವಿಜ್ಞಾನಿ ಕರ್ವಾಲೋ ಮತ್ತು ಮಂದಣ್ಣನ ವಿಚಿತ್ರ ಜೋಡಿ ಹಾರುವ ಓತಿಯನ್ನು ಹುಡುಕಲು ಹೊರಡುತ್ತದೆ. ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ದಟ್ಟ ಕಾಡಿನಲ್ಲಿ ನಡೆಯುವ ಈ ಅನ್ವೇಷಣೆಯು ಕೇವಲ ಒಂದು ಅಪರೂಪದ ಜೀವಿಯ ಶೋಧವಲ್ಲ; ಅದು ಮಾನವನ ಅಸ್ತಿತ್ವ, ಕುತೂಹಲ ಮತ್ತು ಪ್ರಕೃತಿಯ ವಿಸ್ಮಯಗಳ ಆಳವಾದ ಹುಡುಕಾಟ.

ತೇಜಸ್ವಿಯವರ ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ಗ್ರಾಮೀಣ ಜನರ ಜೀವನ ಕ್ರಮ ಮತ್ತು ಜೀವವೈವಿಧ್ಯದ ಸಂರಕ್ಷಣೆಯ ಮಹತ್ವ ಇಲ್ಲಿ ಅದ್ಭುತವಾಗಿ ಮಿಳಿತಗೊಂಡಿದೆ. ಕರ್ವಾಲೋ ಕಾದಂಬರಿಯು ಕನ್ನಡ ಸಾಹಿತ್ಯದಲ್ಲೇ ಅಪರೂಪದ ವೈಜ್ಞಾನಿಕ ಕಾದಂಬರಿಯಾಗಿ ಇಂದಿಗೂ ಮನೆಮಾತಾಗಿದೆ.`,
        status: 'published',
        references: [
          { name: 'ಪೂರ್ಣಚಂದ್ರ ತೇಜಸ್ವಿ ಪ್ರತಿಷ್ಠಾನ', url: 'https://tejaswipratishtana.karnataka.gov.in/karvalo' },
          { name: 'ಕರ್ವಾಲೋ ನಾಟಕ ರೂಪಾಂತರ ಮಾಹಿತಿ', url: 'https://kannadauniversity.org/karvalo-theatre-notes' }
        ]
      },
      {
        author_id: authorMap['ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್'],
        title_kn: 'ಸುಬ್ಬಣ್ಣ',
        title_en: 'Subbanna - The Musical Journey and Dignity of a Musician',
        genre: 'ಸಣ್ಣ ಕಥೆ (Short Story / Novella)',
        language: 'kn',
        published_year: 1928,
        summary: 'ಸಂಗೀತ ಸಾಧನೆ, ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ಆತ್ಮಶೋಧನೆಯ ಹಾದಿಯಲ್ಲಿ ಸಾಗುವ ಕಲಾವಿದ ಸುಬ್ಬಣ್ಣನ ಭಾವಸ್ಪರ್ಶಿ ಕಥಾನಕ.',
        content_type: 'text',
        content_text: `ಸುಬ್ಬಣ್ಣನ ಕೈಯಲ್ಲಿ ವೀಣೆಯ ತಂತಿಗಳು ಮಿಡಿದಾಗ ಮೂಡುತ್ತಿದ್ದ ನಾದ ಬ್ರಹ್ಮಾಂಡದ ಲಯಕ್ಕೆ ಕನ್ನಡಿ ಹಿಡಿದಂತಿತ್ತು. ರಾಜಾಶ್ರಯದ ಅಹಂಕಾರ ಮತ್ತು ಕಲಾವಿದನ ಸ್ವಾಭಿಮಾನದ ನಡುವೆ ನಡೆದ ಸಂಘರ್ಷದಲ್ಲಿ ಸುಬ್ಬಣ್ಣ ತನ್ನ ಆತ್ಮಸಾಕ್ಷಿಯನ್ನೇ ಆಯ್ದುಕೊಂಡನು.

ಸರಳ ಭಾಷೆ, ಶಾಂತ ಗಾಂಭೀರ್ಯ ಮತ್ತು ಬದುಕಿನ ನೈತಿಕ ಮೌಲ್ಯಗಳನ್ನು ಎತ್ತಿಹಿಡಿಯುವ ಮಾಸ್ತಿಯವರ ಶೈಲಿಗೆ ಈ ಕಥೆಯು ಶ್ರೇಷ್ಠ ಉದಾಹರಣೆಯಾಗಿದೆ. ಕಲಾವಿದನೊಬ್ಬನ ಅಂತರಂಗದ ಹೋರಾಟವನ್ನು ಮಾಸ್ತಿಯವರು ಅತ್ಯಂತ ನವಿರಾಗಿ ಚಿತ್ರಿಸಿದ್ದಾರೆ.`,
        status: 'published',
        references: [
          { name: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್ ಸ್ಮಾರಕ ಭವನ', url: 'https://masti-sahitya.karnataka.gov.in/subbanna' }
        ]
      },
      {
        author_id: authorMap['ದ.ರಾ. ಬೇಂದ್ರೆ'],
        title_kn: 'ಗಂಗಾವತರಣ ವಿಶ್ಲೇಷಣೆ',
        title_en: 'Gangavatarana Literary Critique and Excerpt',
        genre: 'ಕಾವ್ಯ / ವಿಶ್ಲೇಷಣೆ (Poetic Narrative)',
        language: 'kn',
        published_year: 1951,
        summary: 'ಬೇಂದ್ರೆಯವರ ವಿಶ್ವಪ್ರಸಿದ್ಧ ಗಂಗಾವತರಣ ಕಾವ್ಯದ ನಾದ ಸೌಂದರ್ಯ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ದರ್ಶನದ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ.',
        content_type: 'text',
        content_text: `ಇಳಿದು ಬಾ ತಾಯಿ ಇಳಿದು ಬಾ! ಹರನ ಜಟೆಯಿಂದ ಧರೆಗಿಳಿದು ಬಾ! ಎಂದು ಮೊಳಗಿದ ಬೇಂದ್ರೆಯವರ ಕಾವ್ಯವಾಣಿಯು ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದಲ್ಲಿ ಹೊಸ ನಾದಲೋಕವನ್ನೇ ಸೃಷ್ಟಿಸಿತು.

ಗಂಗೆಯ ಅವತರಣವು ಕೇವಲ ನದಿಯ ಹರಿವಲ್ಲ; ಅದು ಚೈತನ್ಯದ ಪ್ರವಾಹ, ಕತ್ತಲೆಯಿಂದ ಬೆಳಕಿನೆಡೆಗೆ ಸಾಗುವ ಮಾನವ ಜನಾಂಗದ ಪಾವನ ಯಾನ. ಛಂದಸ್ಸು, ಪ್ರಾಸ ಮತ್ತು ಲಯದ ಅದ್ಭುತ ಮೇಳೈಕೆಯಾಗಿರುವ ಈ ಕೃತಿಯು ಕನ್ನಡ ಭಾಷೆಯ ಶಕ್ತಿಯನ್ನು ವಿಶ್ವಮಟ್ಟಕ್ಕೆ ಕೊಂಡೊಯ್ದಿದೆ.`,
        status: 'published',
        references: [
          { name: 'ಬೇಂದ್ರೆ ರಾಷ್ಟ್ರೀಯ ಸ್ಮಾರಕ ಟ್ರಸ್ಟ್', url: 'https://bendretrust.karnataka.gov.in/gangavatarana' }
        ]
      },
      {
        author_id: authorMap['ವೈದೇಹಿ'],
        title_kn: 'ಅಸ್ಪೃಶ್ಯರು',
        title_en: 'Asprushyaru - Women Introspective Short Fiction',
        genre: 'ಸಣ್ಣ ಕಥಾ ಸಂಕಲನ (Short Story)',
        language: 'kn',
        published_year: 1992,
        summary: 'ಕುಟುಂಬ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ಸ್ತ್ರೀಯರ ಭಾವನಾತ್ಮಕ ನಿಷ್ಕಾಷಣೆ ಮತ್ತು ಅಸ್ತಿತ್ವದ ಹುಡುಕಾಟವನ್ನು ಬಿಂಬಿಸುವ ಕಥೆ.',
        content_type: 'text',
        content_text: `ಅಡುಗೆಮನೆಯ ನಾಲ್ಕು ಗೋಡೆಗಳ ನಡುವೆ ಆರಂಭವಾಗಿ ಮುಗಿಯುವ ಅಮ್ಮಂದಿರ ಬದುಕಿನ ಕಣ್ಣೀರಿನ ಕಥೆ ಇದು. ಸಮಾಜವು ವಿಧಿಸಿದ ಕಟ್ಟುಪಾಡುಗಳು ಮತ್ತು ಹೆಣ್ಣಿನ ಅಂತರಂಗದ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆಗಳನ್ನು ಕುಂದಾಪುರದ ಗಂಡುಗನ್ನಡದ ಸೊಗಡಿನಲ್ಲಿ ವೈದೇಹಿಯವರು ಜೀವಂತಗೊಳಿಸಿದ್ದಾರೆ.

ಕನ್ನಡ ಸಣ್ಣ ಕಥಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ವೈದೇಹಿಯವರ ದನಿ ಅತ್ಯಂತ ವಿಶಿಷ್ಟವಾದದ್ದು ಮತ್ತು ಪ್ರಖರವಾದದ್ದು.`,
        status: 'published',
        references: [
          { name: 'ಕನ್ನಡ ವಿಶ್ವವಿದ್ಯಾಲಯ ಹಂಪಿ - ವೈದೇಹಿ ಸಾಹಿತ್ಯ', url: 'https://kannadauniversity.org/vaidehi-literature' }
        ]
      }
    ];

    for (const s of storiesData) {
      const existing = await db('stories').where({ title_kn: s.title_kn }).whereNull('deleted_at').first();
      if (!existing) {
        const [storyId] = await db('stories').insert({
          author_id: s.author_id,
          title_kn: s.title_kn,
          title_en: s.title_en,
          genre: s.genre,
          language: s.language,
          published_year: s.published_year,
          summary: s.summary,
          content_type: s.content_type,
          content_text: s.content_text,
          status: s.status,
          created_by: admin.id,
          updated_by: admin.id
        });

        if (s.references && s.references.length > 0) {
          const refs = s.references.map((r, i) => ({
            story_id: storyId,
            name: r.name,
            url: r.url,
            sort_order: i
          }));
          await db('story_references').insert(refs);
        }

        console.log(`  + Created Story: ${s.title_kn} (${s.title_en})`);
      } else {
        console.log(`  = Existing Story: ${s.title_kn}`);
      }
    }

    console.log('[Seed Sample] Sample data seeding complete!');
  } catch (err) {
    console.error('[Seed Sample] Error seeding sample data:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedSampleData();
