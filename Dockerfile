# Šolska pustolovščina - staticna stran v nginx
FROM nginx:alpine

# UTF-8 za slovenske crke in brez predpomnjenja med razvojem
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  charset utf-8;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '    add_header Cache-Control "no-store";' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
