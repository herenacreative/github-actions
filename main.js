// hello_algolia.js
const algoliasearch = require('algoliasearch')

// Connect and authenticate with your Algolia app
const client = algoliasearch('', '')

// // Create a new index and add a record
// const index = client.initIndex('bakir')
// const record = [{
//   firstname: 'Jimmie',
//   lastname: 'Barninger',
//   objectID: 'myID1'
// }, {
//   firstname: 'Warren',
//   lastname: 'Speach',
//   objectID: 'myID2'
// }]

// index.saveObjects(record).wait()

// Search the index and print the results
// index
//   .search('bakir')
//   .then(({ hits }) => console.log(hits[0]))

const fs = require('fs');
const matter = require('gray-matter');
const path = require('path');
const dotenv = require('dotenv');
const showdown  = require('showdown')
// function firstFourLines(file, options) {
//     file.excerpt = file.content.split('\n').join(' ');
//   }
// const str = matter.read('deploy-to-flu-io.md');

// const str = matter.read(['overview.md'].join('\n'));
// const str = matter.read(['run-in-docker.md'].join('\n'));
// console.log(matter.stringify(str));
// const str = matter.read('probes.md', {delims: '~~~'});

// console.log(matter(str, { excerpt: firstFourLines }));

// var md2json = require('md-2-json');
// var mdContent = ('deploy-to-flu-io.md')

// console.log(md2json.parse(mdContent));

try {
  dotenv.config();

  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
      throw new Error("NEXT_PUBLIC_ALGOLIA_APP_ID is not defined");
  }

  if (!process.env.ALGOLIA_SEARCH_ADMIN_KEY) {
      throw new Error("ALGOLIA_SEARCH_ADMIN_KEY is not defined");
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}

console.log("It works!")
const file = ('guides','tutorial', 'deployment', '')
const CONTENT_PATH = path.join(process.cwd(), file)
const contentFilePaths = fs
    .readdirSync(CONTENT_PATH)
    // Only include md(x) files
    .filter((path) => /\.md?$/.test(path))
console.log(contentFilePaths, 'content')
const converter = new showdown.Converter()
// const html      = converter.makeHtml(contentFilePaths);

    async function getAllBlogPosts() {
      const articles = contentFilePaths.map((filePath) => {
          const source = fs.readFileSync(path.join(CONTENT_PATH, filePath))
          const { content, data } = matter(source)
          console.log(CONTENT_PATH)
          const contentHtml = converter.makeHtml(`${content}`);
        //   console.log(contentHtml, 'content', data,)
          return {
            contentHtml,
              // title,
            //   content, // this is the .mdx content
              data, // this is the frontmatter
              filePath, // this is the file path
          }
      })
      // console.log(articles, 'articles')
      return articles
  }

  function transformPostsToSearchObjects(articles) {
    const transformed = articles.map(article => {
      // console.log(article, '222article')
        return {
            objectID: article.data.id,
            title: article.data.title,
            content: article.contentHtml,
            slug: article.filePath,
            url: `https://monika.hyperjump.tech/guides/probes`
            // tagsCollection: { tags: article.data.tags }, // we can nest objects in Algolia!
            // date: article.data.publishedAt,
            // type: 'article',
            // ...
        };
    });
// console.log(transformed, 'transformed');
    return transformed;
}

// everything we did so far is here

(async function () {
  // initialize environment variables
  dotenv.config();

  try {
      const articles = await getAllBlogPosts();
      const transformed = transformPostsToSearchObjects(articles);

      // initialize the client with your environment variables
      const client = algoliasearch(
          process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
          process.env.ALGOLIA_SEARCH_ADMIN_KEY,
      );

      // initialize the index with your index name
      const index = client.initIndex("dev");

      // add the data to the index
      const algoliaResponse = await index.saveObjects(transformed);
        // console.log(algoliaResponse, 'test')
      console.log(
          `Successfully added ${algoliaResponse.objectIDs.length} records to Algolia search! Object IDs:\n${algoliaResponse.objectIDs.join(
              "\n",
          )}`,
      );
  }
  catch (err) {
      console.error(err);
  }
})();
