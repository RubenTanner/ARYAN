require("dotenv").config(); // Load environment variables from .env
const { Client, GatewayIntentBits } = require("discord.js");

// Create the bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Log a confirmation message when the bot is online
client.on("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

// Handle new members joining the server
client.on("guildMemberAdd", async (member) => {
  const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const accountAge = Date.now() - member.user.createdAt.getTime();

  if (accountAge < oneDayInMs) {
    const remainingTime = oneDayInMs - accountAge;

    try {
      // Timeout the user for the remaining time
      await member.timeout(remainingTime, "Account too new");
      console.log(
        `Timed out ${member.user.tag} for ${Math.ceil(
          remainingTime / (60 * 60 * 1000)
        )} hours.`
      );

      // Send a DM to the user explaining the timeout
      try {
        await member.send(
          `Hi ${
            member.user.username
          }, your account is too new to join this server. You have been timed out for ${Math.ceil(
            remainingTime / (60 * 60 * 1000)
          )} hours. Please try again later.`
        );
        console.log(`Sent DM to ${member.user.tag}.`);
      } catch (err) {
        console.log(`Could not DM ${member.user.tag}.`);
      }
    } catch (err) {
      console.error(`Failed to timeout ${member.user.tag}:`, err);
    }
  } else {
    console.log(`${member.user.tag} joined. Account age is acceptable.`);
  }
});

// Bot login
client.login(process.env.BOT_TOKEN);
