const { LokaliseApi } = require('@lokalise/node-api');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.LOKALISE_API_KEY;
const PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

const lokaliseApi = new LokaliseApi({ apiKey: API_KEY });

// recursively call to form the right object
const unflatten = (data, path, key) => {
  const segment = path.shift();
  if (!path.length) {
    data[segment] = key.translations[0].translation;
    return;
  }

  data[segment] = data[segment] ? data[segment] : {};
  unflatten(data[segment], path, key);
};

/**
 * fetch the keys in the project for specific platform which are not hidden and archived
 * @return keys in the project
 */
const getProjectTranslationKeys = async (projectID, languageID) =>
  (
    await lokaliseApi.keys.list({
      project_id: PROJECT_ID,
      filter_platforms: 'web',
      include_translations: 1,
      filter_translation_lang_ids: languageID,
      limit: 5000,
    })
  ).filter(({ is_hidden, is_archived }) => !is_hidden && !is_archived);

(async () => {
  // build contexts help to build the keys for two different projects ie Data4Life and Smart4Health

  const translationsDirectory = `${__dirname}/../client/src/translations`;
  // create translations directory based on project if it doesnt exist
  if (!fs.existsSync(translationsDirectory)) {
    fs.mkdirSync(translationsDirectory);
  }
  const projectLanguages = await lokaliseApi.languages.list({
    project_id: PROJECT_ID,
  });
  // iterate over each language in the project
  for await (language of projectLanguages) {
    const translationKeys = await getProjectTranslationKeys(
      PROJECT_ID,
      language.lang_id
    );

    const buildContext = 's4h';

    let translationsCount = 0;
    const translationsObject = {};

    translationKeys.forEach(key => {
      const keyName = key.key_name.web;
      const namespaceCount = keyName.includes('::') && keyName.match(/::/g).length;

      let keyContext = 'd4l';
      let namespace = 'master';

      if (namespaceCount === 2) {
        // if there are two namespaces, first one is the key context and second is the namespace
        keyContext = keyName.split('::')[0];
        namespace = keyName.split('::')[1];
      } else if (namespaceCount === 1) {
        // if there is only a namespace, we have to check if the namespace is a key context or a real namespace
        const namespaceContext = keyName.split('::')[0];
        if (buildContext === namespaceContext) {
          // special case to check if its a real namespace
          keyContext = namespaceContext;
        } else {
          namespace = namespaceContext;
        }
      }

      if (!translationsObject[namespace]) {
        translationsObject[namespace] = {};
      }

      const splitKeys = keyName.split('::');
      const keyPath = splitKeys[splitKeys.length - 1].split('.');
      unflatten(translationsObject[namespace], keyPath, key);
      translationsCount += 1;
    });

    fs.writeFileSync(
      `${translationsDirectory}/${language.lang_iso}.${buildContext}.json`,
      JSON.stringify(translationsObject, null, 2)
    );

    console.log(
      `Translated ${translationsCount} keys for ${language.lang_iso}:${buildContext}`
    );
  }
})();
