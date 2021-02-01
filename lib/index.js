'use strict';

// https://github.com/meilisearch/meilisearch-js
import { MeiliSearch } from 'meilisearch'

/**
 * MeiliSearch Hook
 */

module.exports = strapi => {
  const hook = {
    /**
     * Default options
     * This object is merged to strapi.config.hook.settings.meilisearch
     */
    defaults: {
      apiKey: 'masterKey',
      debug: false,
      host: 'http://127.0.0.1:7700',
      prefix: strapi.config.environment,
    },

    /**
     * Initialize the hook
     */
    async initialize() {

      // Merging defaults and config/hook.json
      const { apiKey, debug, host, prefix } = {
        ...this.defaults,
        ...strapi.config.hook.settings.meilisearch
      };

      const client = new MeiliSearch({
        host,
        apiKey
      })

      const initIndex = (indexName) => {
        return client.index(`${prefix}_${indexName}`);
      };

      strapi.services.meilisearch = {
        /**
         * Meilisearch Client
         */
        client,

        /**
         * Add the document to the search index
         *
         * Should be called in the afterSave Lifecycle callback
         *
         * @param {document} document - the saved data of a Strapi model
         * @param {string} indexName
         */
        saveObject: function (document, indexName) {
          const response = await initIndex.addDocuments([document])
          console.log(response)

          if (debug) strapi.log.debug(`Saved document: ${document.id} to MeiliSearch index: ${indexName}`);
        },

        /**
         * Removes the document from the search index 
         *
         * Should be called in the afterDelete Lifecycle callback
         *
         * @param {string} documentId
         * @param {string} indexName
         */
        deleteObject: function (documentId, indexName) {

          const response = await initIndex.deleteDocument(documentId)
          console.log(response)

          if (debug) strapi.log.debug(`Deleted document: ${documentId} from MeiliSearch index: ${indexName}`);
        }
      };
    }
  };

  return hook
};

