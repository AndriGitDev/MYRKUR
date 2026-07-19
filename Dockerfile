FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html style.css script.js /usr/share/nginx/html/
COPY .well-known /usr/share/nginx/html/.well-known

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
