@echo off
title SmoothStep - Expo-Server (dieses Fenster offen lassen!)
cd /d "%~dp0"
echo.
echo  SmoothStep wird gestartet ...
echo  Gleich erscheint ein QR-Code. Mit der iPhone-Kamera scannen.
echo  Dieses Fenster offen lassen, solange du die App benutzt.
echo.
call npx expo start --tunnel
pause
