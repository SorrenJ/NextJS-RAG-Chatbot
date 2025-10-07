import { DataAPIClient } from "@datastax/astra-db-ts"

import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"

import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

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