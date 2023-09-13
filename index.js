const { Client, GatewayIntentBits, CommandInteraction } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { token } = require('./config.json');
const fs = require('fs');
const csv = require('csv-parser');
const { EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});
const commands = [
  new SlashCommandBuilder()
    .setName('berb')
    .setDescription('Search for berb data')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The RugBerbs ID')
        .setRequired(true)
    ),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands('1140258314622603364', '1115249282040221767'),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    const command = interaction.commandName;
    if (command === 'berb') {
      await interaction.reply('Working on it');
      const searchFilename = interaction.options.getString('id').trim().toLowerCase();
  
      if (!searchFilename) {
        await interaction.reply('Invalid filename.');
        return;
      }
  
      const data = [];
      fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.Filename.toLowerCase() === searchFilename) {
            data.push(row);
          }
        })
        .on('end', async () => {
          if (data.length === 0) {
            await interaction.reply('No data found for the specified id.');
          } else {
            const row = data[0];
            const rank = row.RANK;
            const background = row.BACKGROUND;
            const feather = row.FEATHER;
            const outwear = row.OUTWEAR;
            const beak = row.BEAK;
            const headwear = row.HEADWEAR;
            const eyes = row.EYES;
            const eyeware = row.EYEWEAR;
            const imageLink = `https://talis-protocol.mo.cloudinary.net/inj/tokens/${row.LINK}/mediaThumbnail`;
  
            const embed = new EmbedBuilder()
              .setColor(0x0099FF)
              .setTitle('Berb ' + searchFilename)
              .addFields(
                { name: 'Rank', value: rank},
                { name: 'Background', value: background, inline:true },
                { name: 'Feather', value: feather, inline:true },

              )
              .addFields(
                { name: 'Beak', value: beak,inline:true },
                { name: 'Outwear', value: outwear,inline:true },
              )
              .addFields(
                { name: 'Headwear', value: headwear, inline:true },
                { name: 'Eyes', value: eyes, inline:true },
                { name: 'Eyeware', value: eyeware, inline:true }
              )
              .setImage(imageLink)
              await interaction.editReply("Done");
              await interaction.editReply({ embeds: [embed] });
          }
        });
    }
  });
  

client.login(token);
