#!/bin/sh

echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  REACT_APP_API_BASE_URL: \"${REACT_APP_API_BASE_URL}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js
