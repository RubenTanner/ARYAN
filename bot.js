require("dotenv").config(); // Load environment variables from .env
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

// Create the bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Default settings
let minAccountAge = 24; // Default to 24 hours
let dmMessage =
  "Hi {user}, your account is too new to join this server. You have been timed out for {hours} hours. Please try again later.";

// Slash command definitions
const commands = [
  {
    name: "setminage",
    description: "Set the minimum account age (in hours) for new members.",
    options: [
      {
        name: "hours",
        description: "Minimum account age in hours.",
        type: 4, // INTEGER i love docs with random things like this...why 4?!
        required: true,
      },
    ],
  },
  {
    name: "setmessage",
    description: "Set a custom DM message for timed-out users.",
    options: [
      {
        name: "message",
        description:
          "The custom message (use {user} and {hours} as placeholders).",
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

// Register slash commands
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Refreshing slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Slash commands registered successfully.");
  } catch (err) {
    console.error("Failed to register slash commands:", err);
  }
})();

// Log when the bot is ready and rearing to go
client.on("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "setminage") {
    const minHours = interaction.options.getInteger("hours");
    minAccountAge = minHours;
    await interaction.reply(`Minimum account age set to ${minHours} hours.`);
  } else if (interaction.commandName === "setmessage") {
    const customMessage = interaction.options.getString("message");
    dmMessage = customMessage;
    await interaction.reply("Custom DM message has been updated.");
  }
});

// Handle new members joining
client.on("guildMemberAdd", async (member) => {
  const minAccountAgeMs = minAccountAge * 60 * 60 * 1000; // Convert hours to milliseconds
  const accountAge = Date.now() - member.user.createdAt.getTime();

  if (accountAge < minAccountAgeMs) {
    const remainingTime = minAccountAgeMs - accountAge;

    try {
      // Timeout the user for the remaining time
      await member.timeout(remainingTime, "Account too new");
      console.log(
        `Timed out ${member.user.tag} for ${Math.ceil(
          remainingTime / (60 * 60 * 1000)
        )} hours.`
      );

      // Send a DM to the user explaining the timeout (uses custom message)
      const finalMessage = dmMessage
        .replace("{user}", member.user.username)
        .replace("{hours}", Math.ceil(remainingTime / (60 * 60 * 1000)));
      try {
        await member.send(finalMessage);
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

// Log in to Discord
client.login(process.env.BOT_TOKEN);
