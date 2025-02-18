import telebot
import schedule
import time
from threading import Thread

# 🛠️ Remplace avec ton token
TOKEN = "7718678694:AAH26eWL1asTS5vxsK_9ZDwlWNEzwsyxCws"
bot = telebot.TeleBot(TOKEN)

# 📌 Remplace avec tes IDs
CHANNEL_ID = "-1002428206155"
GROUP_ID = "-1002266085456"

# 📝 Procédure d'investissement
procedure_text = """
🚀 **Procédure d'Investissement** 🚀

📌 **A- Création de compte et premier dépôt**  
1️⃣ [Créez un compte Izichange](https://home.izichange.com/sign-up?ref=369845)  
2️⃣ Vérifiez votre profil et effectuez votre premier paiement.  
3️⃣ Attendez 10 minutes puis rechargez la page.

📌 **B- Configuration de votre compte**  
4️⃣ Accédez à "Mes adresses" pour configurer vos portefeuilles.  
5️⃣ Ajoutez un portefeuille de facturation et de réception.  
6️⃣ Validez la configuration de votre compte.

📌 **C- Rechargement de votre compte d'investissement**  
7️⃣ Accédez à "Achat et Vente".  
8️⃣ Sélectionnez le moyen de paiement et entrez le montant à investir.  
9️⃣ Finalisez le paiement et attendez quelques minutes.

✅ Votre compte sera mis à jour et vous commencerez à générer des bénéfices ! 🚀
"""

# 🔹 Fonction pour envoyer la procédure tous les jours à 8h
def send_daily_procedure():
    bot.send_message(CHANNEL_ID, procedure_text, parse_mode="Markdown")
    bot.send_message(GROUP_ID, procedure_text, parse_mode="Markdown")

# 🔹 Planification automatique à 8h
schedule.every().day.at("08:00").do(send_daily_procedure)

# 🔹 Fonction pour répondre si un utilisateur envoie "procédure"
@bot.message_handler(func=lambda message: "procédure" in message.text.lower())
def send_procedure_on_request(message):
    bot.reply_to(message, procedure_text, parse_mode="Markdown")

# 🔹 Exécuter le planificateur en parallèle
def schedule_runner():
    while True:
        schedule.run_pending()
        time.sleep(60)

# 🔹 Démarrer le bot
if __name__ == "__main__":
    Thread(target=schedule_runner).start()
    bot.polling(none_stop=True)
