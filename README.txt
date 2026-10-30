REDIRECT SYSTEM — ব্যবহার নির্দেশিকা
====================================

ফোল্ডার স্ট্রাকচার
------------------
index.html        → মূল পেজ
css/styles.css    → ডিজাইন/অ্যানিমেশন
js/script.js      → সব logic (config এখানেই)
gifs/             → ডেমো GIF (নিজেরটা বসালে এগুলো লাগবে না)

নিজের GIF লিংক বসানো
----------------------
js/script.js ফাইলের একদম উপরে GIF_URLS লিস্টে নিজের GIF লিংক পেস্ট করুন:
  var GIF_URLS = [
    "https://example.com/your-gif-1.gif",
    "https://example.com/your-gif-2.gif"
  ];

Redirect লিংক বদলানো
----------------------
js/script.js-এ TARGET_LINKS লিস্ট এডিট করুন। প্রতি visit-এ একটা করে
লিংক ঘুরে ঘুরে খুলবে (localStorage-এ মনে থাকে)।

সময় বদলানো
------------
js/script.js-এ REDIRECT_SECONDS = 5 → যত সেকেন্ড চান সেট করুন।

Hosting
--------
পুরো ফোল্ডারটা (index.html, css/, js/, gifs/) যেকোনো static hosting-এ
আপলোড করলেই চলবে — কোনো server বা database লাগে না।

কীভাবে কাজ করে
---------------
১. পেজ খুললে পুরো স্ক্রিন জুড়ে ছোট ছোট GIF ভেসে বেড়ায়
২. countdown ring সহ ৫ সেকেন্ড অপেক্ষা
৩. ৫ সেকেন্ড পরে automatic external browser-এ redirect:
   - Android (Facebook/Instagram in-app): Chrome intent URL
   - iPhone (Facebook in-app): external Safari view + fallback
   - Desktop/normal browser: সরাসরি redirect
৪. Auto redirect না খুললে "এখনই খুলুন" বাটন দেখা যায়
