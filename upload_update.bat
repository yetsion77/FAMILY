@echo off
echo מעלה עדכון עבור הורדת תמונות, הגדרות מין חכמות ותצוגת כלות/חתנים...
git add .
git commit -m "UX improvements: removed avatars, improved spouses tracking in tree display, and removed explicit gender requests for deterministic relations."
git push
echo סיימנו! שודרג בהצלחה.
pause
