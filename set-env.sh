Skrypt set-env.sh Stwórz skrypt set-env.sh, który ustawia dynamiczne zmienne środowiskowe:


echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  REACT_APP_API_BASE_URL: \"${REACT_APP_API_BASE_URL}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js
