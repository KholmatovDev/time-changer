const express = require("express");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const moment = require("moment");
const bodyParser = require("body-parser");

const apiId = YOUR_API_ID; // Telegram API ID
const apiHash = "YOUR_API_HASH"; // Telegram API Hash

const stringSession = new StringSession(""); // Oldin sessiya mavjud bo'lsa, shu yerga kiriting
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(`
        <form action="/update-bio" method="post">
            <label>Telefon raqam:</label>
            <input type="text" name="phoneNumber" required><br>
            <label>Parol (agar mavjud bo'lsa):</label>
            <input type="password" name="password"><br>
            <label>Bio matni:</label>
            <input type="text" name="bioText" required><br>
            <button type="submit">Yangilash</button>
        </form>
    `);
});

app.post("/update-bio", async (req, res) => {
    const { phoneNumber, password, bioText } = req.body;
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

    try {
        await client.start({
            phoneNumber: async () => phoneNumber,
            password: async () => password,
            phoneCode: async () => {
                throw new Error("Kodni kiritish uchun qo'lda qo'shish kerak");
            },
            onError: (err) => console.log(err),
        });

        console.log("Muvaffaqiyatli login qilindi!");
        console.log("Session string:", client.session.save());

        const currentDate = moment().format("YYYY-MM-DD");
        const newBio = `${bioText}\n${currentDate}`;

        await client.invoke(new Api.account.UpdateProfile({ about: newBio }));
        console.log("Bio yangilandi:", newBio);
        res.send("Bio muvaffaqiyatli yangilandi!");
    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        res.status(500).send("Xatolik yuz berdi: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} da ishlamoqda`);
});
