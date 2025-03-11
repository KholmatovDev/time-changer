const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 26641389;         // my.telegram.org'dan olingan api_id
const apiHash = "559e14a34f84c378d80348be7d484b36";   // my.telegram.org'dan olingan api_hash
const stringSession = new StringSession(""); // Agar oldin login qilmagan bo'lsangiz

// Joriy sanani olish uchun funksiya
function getCurrentDate() {
    const date = new Date();
    // Sana formatini istalgan tarzda sozlashingiz mumkin
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Oyni 0-indeks sifatida qaytaradi
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Telefon raqamingizni kiriting: "),
        password: async () => await input.text("2FA parolni kiriting (agar bo'lsa): "),
        phoneCode: async () => await input.text("SMS yoki Telegram kodi: "),
        onError: (err) => console.log(err),
    });
    console.log("Session string:", client.session.save());

    console.log("Telegramga muvaffaqiyatli ulandik!");

    // Har 24 soatda profil bio'sini yangilash
    setInterval(async () => {
        const newBio = `Memento Mori ${getCurrentDate()}`;
        try {
            await client.invoke(
                new Api.account.UpdateProfile({
                    about: newBio,
                })
            );
            console.log(`Profil bio yangilandi: ${newBio}`);
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
        }
    }, 86400000); // 86400000 millisekund = 24 soat

    // Dastlabki bir martalik yangilanish
    const initialBio = `Memento Mori ${getCurrentDate()}`;
    try {
        await client.invoke(
            new Api.account.UpdateProfile({
                about: initialBio,
            })
        );
        console.log(`Dastlabki profil bio yangilandi: ${initialBio}`);
    } catch (error) {
        console.error("Dastlabki yangilanishda xatolik:", error);
    }
})();
