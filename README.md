# Discord-Roulette
JS Web App that displays a random Discord message from your chosen chat
![Example Image](https://i.ibb.co/J776CbH/fucked.png)

# Making it Work
You'll need:
- https://github.com/Tyrrrz/DiscordChatExporter
- A YouTube API Key (Don't have one? Go here: https://www.slickremix.com/docs/get-api-key-for-youtube/)

First, use DiscordChatExporter to generate a JSON file of your chosen channel/DMs. Name it what whatever you want and put the path including '.json' into the msgFileName field in vars.json. Do the same with your YouTube API key by putting it in the ytAPIKey field.

Then, just open index.html and it should work, just press space to get a new random message. YouTube thumbnails are clickable and open the video in a new tab. Images may take some time to load, so if the message looks blank just wait a second or so.

Enjoy!
