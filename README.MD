# ARYAN - Automated Reviewer of Youthful Accounts and Nuisances

**ARYAN** is a Discord bot designed to manage your server by enforcing account age restrictions and providing logging for mods.

Tired of banning accounts, only having them return immediately with a fresh alt? ARYAN acts as your server’s bouncer, checking accounts are older than your server's set minimum account age.

## Features

- **Account Age checking**: Automatically time out new members if their account is younger than the configured minimum age.
- **Customizable Timeout Messages**: Configure personalized messages for users who are timed out.
- **Logging**: Send logs of bot actions to a designated channel.
- **Slash Commands**: Easily use ARYAN with discords / commands.

## Commands

### `/setminage`

Set the minimum account age (in hours) for new members to join your server.

- **Usage**: `/setminage hours: 24`
- **Description**: Sets the minimum account age to 24 hours.

### `/setusermessage`

Set the message sent to users who are timed out.

- **Usage**: `/setusermessage message: Hi {user}, your account is too new to join this server. You have been timed out for {hours} hours.`
- **Description**: Personalise the timeout message. Use placeholders `{user}` and `{hours}` to dynamically include the user's name and amount of time they are timed out for.

### `/setlogschannel`

Set the channel for logging actions.

- **Usage**: `/setlogschannel channel: #staff-logs`
- **Description**: Specify the channel where logs will be sent.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RubenTanner/ARYAN.git
   cd ARYAN
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file:

   ```
   BOT_TOKEN=your-bot-token
   CLIENT_ID=your-client-id
   ```

4. Run the bot:
   ```bash
   node bot.js
   ```

## Requirements

- Node.js
- A Discord bot token (available via the [Discord Developer Portal](https://discord.com/developers/applications))
- Proper permissions for the bot in your server.

## Permissions

To ensure ARYAN functions correctly, the bot needs the following permissions:

- **View Channels**
- **Send Messages**
- **Use Slash Commands**
- **Moderate Members**

## Contribution

Feel free to contribute to ARYAN by opening issues or submitting pull requests.

## Support Me

Like what you see? Why not support me on Ko-fi!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G118SIB1)

---

Give your server it's own bouncer with ARYAN.
