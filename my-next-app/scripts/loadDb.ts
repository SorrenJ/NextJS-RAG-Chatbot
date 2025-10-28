import { DataAPIClient } from "@datastax/astra-db-ts"

import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"

import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

// https://docs.datastax.com/en/astra-db-serverless/get-started/vector-concepts.html#metrics
type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_API_APPLICATION_TOKEN, 
    OPENAI_API_KEY  
} = process.env


const openai = new OpenAI ({ apiKey: OPENAI_API_KEY })

// place links for more web scraping
const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One'
]

const client = new DataAPIClient(ASTRA_DB_API_APPLICATION_TOKEN)
    
   const db = client.db( ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE});


   // spliting characters into chunks
   /*
Compared to a whole document, smaller chunks of text capture fewer topics or ideas, 
which means that their embeddings will contain more focused meaning
https://www.datastax.com/blog/how-to-chunk-text-in-javascript-for-rag-applications
   */

   const splitter = new RecursiveCharacterTextSplitter ({
    chunkSize: 512, // number of characters generated
    chunkOverlap: 100
   })


// embedding model metrics
// https://docs.datastax.com/en/astra-db-serverless/get-started/vector-concepts.html#metrics
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric
    }
  });

  console.log(res);
};


// this function scrapes content from the url
// embedding model also goes here
const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
for await ( const url of f1Data) {

   
    const content = await scrapePage(url)
    const chunks = await splitter.splitText(content)
    for await ( const chunk of chunks ) {

         //https://platform.openai.com/docs/guides/embeddings
        const embedding = await openai.embeddings.create( {
            model: "text-embedding-3-small",
            input: chunk,
            encoding_format: "float" 
        })

          // 47:50
        const vector = embedding.data[0].embedding

        const res = await collection.insertOne({
          $vector: vector,
          text: chunk
        })
        console.log(res);
    }

}
}

// 48:14

// scrapes the page
const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true

    },
    gotoOptions: {
      waitUntil: "domcontentloaded"

    },

    
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML)
      await browser.close()
      return result
    }
  })

  // some regex
return (await loader.scrape())?.replace(/<[^>]*>/gm, '');


}
   
createCollection().then(() => loadSampleData());