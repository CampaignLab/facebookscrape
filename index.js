const scrapingbee = require('scrapingbee');
const fs = require('fs');
const openAI = require('openai').OpenAI;

require('dotenv').config();

const openAImageAnalysisPrompt = "how many likes, comments and shares does this post have and also what is the post's text? also what is the name of the profile that posted and what is the date when they posted? your answer must be formatted as follows: Likes: XYZ, Shares: XYZ, Comments: XYZ, Post Text: XYZ, Name of Profile: XYZ, Date: DD/MM/YYYY"
const facebookPostToScrape     = "https://www.facebook.com/groups/Erdingtonmassives/permalink/10158455560448779/";

async function screenshot(url, path) {
    var client = new scrapingbee.ScrapingBeeClient(process.env.SCRAPING_BEE_KEY);
    var response = await client.get({
        url: url,
        params: {
            screenshot: true, // Take a screenshot
            wait_browser: `networkidle0`,
            screenshot_selector: ""
        }
    });

    fs.writeFileSync(path, response.data);
}

async function analyzeFacebookPost(path) {
    console.log("Analyzing the screenshot");
    const openai = new openAI({ apiKey: process.env.OPEN_AI_KEY });

    const screenshotContents = fs.readFileSync("./screenshots/screenshot.png", "base64")

    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: openAImageAnalysisPrompt },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/png;base64,${screenshotContents}`,
                },
              },
            ],
          },
        ],
      });

      console.log(response.choices[0]);
}

screenshot(facebookPostToScrape, './screenshots/screenshot.png').then((e) =>
    analyzeFacebookPost("./screenshot.png").catch((e) => 
        console.log("Done")
    )
);


