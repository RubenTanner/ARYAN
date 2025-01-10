require("dotenv").config(); // Load environment variables from .env
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ChannelType,
  MessageFlags,
} = require("discord.js");

// Create the bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Defaults
let minAccountAge = 24; // 24 hours minimum account age
let userMessage =
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
    name: "setusermessage",
    description: "Set the message to send to users who are timed out.",
    options: [
      {
        name: "message",
        description: "The message to send to timed out users.",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "setlogschannel",
    description: "Set the channel for logging actions.",
    options: [
      {
        name: "channel",
        description: "The channel where action logs will be sent.",
        type: 7, // CHANNEL
        required: true,
      },
    ],
  },
];

// Store the channel for logs
let logsChannelId = null;

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
    await interaction.reply({
      content: `Minimum account age set to ${minHours} hours.`,
      flags: MessageFlags.Ephemeral, // Only visible to the user who executed the command
    });
  } else if (interaction.commandName === "setusermessage") {
    const newMessage = interaction.options.getString("message");
    userMessage = newMessage;
    await interaction.reply({
      content: "Message has been updated successfully.",
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.commandName === "setlogschannel") {
    const channel = interaction.options.getChannel("channel");
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "Please select a text channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
    logsChannelId = channel.id;
    await interaction.reply({
      content: `Logs will now be sent to ${channel.name}.`,
      flags: MessageFlags.Ephemeral,
    });
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

      // Send an ephemeral message to the user
      await member.send({
        content: userMessage
          .replace("{user}", member.user.username)
          .replace("{hours}", Math.ceil(remainingTime / (60 * 60 * 1000))),
        ephemeral: true,
      });

      // Log the action in the channel set (if any)
      if (logsChannelId) {
        const logsChannel = member.guild.channels.cache.get(logsChannelId);
        if (logsChannel && logsChannel.isTextBased()) {
          await logsChannel.send(
            `**Timeout Log:**
            User: ${member.user.tag} (${member.id})
            Reason: Account too new
            Timeout Duration: ${Math.ceil(
              remainingTime / (60 * 60 * 1000)
            )} hours.`
          );
        }
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
