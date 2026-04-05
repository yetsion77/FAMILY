@echo off
echo מקנפג את המערכת לעבוד עם סינון האתרים...
call npm config set strict-ssl false
call npm config set registry http://registry.npmjs.org/
echo מתקין את התלויות שוב, עשוי לקחת רגע...
call npm install
echo.
echo מפעיל את אפליקציית עץ המשפחה...
call npm run dev
pause
